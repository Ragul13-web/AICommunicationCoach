using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using AICommunicationCoach.Api.Utility;

namespace AICommunicationCoach.Api.Services.Implementations;

public class OrchestratorService : IOrchestratorService
{
    private readonly IGrammarAgent _grammar;
    private readonly IPronunciationAgent _pronunciation;
    private readonly IVocabularyAgent _vocabulary;
    private readonly IFluencyAgent _fluency;
    private readonly IGroqApiClient _groq;

    private const string SynthesisSystemPrompt = """
        You are the lead English communication coach. You receive a learner's original
        text plus structured feedback already produced by four specialist sub-agents
        (grammar, pronunciation, vocabulary, fluency). Your job is to:

        1. Write a short, warm, encouraging overall summary (2-3 sentences) that
           highlights the biggest strength and the single most important area to improve.
        2. Produce a fully corrected/improved version of the learner's original text
           (apply the grammar fixes and better vocabulary, keep their original meaning
           and intent, keep roughly the same length).
        3. Suggest ONE specific, personalized practice exercise the learner should try
           next, based on the weakest area.

        Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:
        {
          "overallSummary": "<2-3 encouraging sentences>",
          "correctedText": "<the improved version of the original text>",
          "nextExercise": "<one specific practice exercise, 1-2 sentences>"
        }
        """;

    public OrchestratorService(
        IGrammarAgent grammar,
        IPronunciationAgent pronunciation,
        IVocabularyAgent vocabulary,
        IFluencyAgent fluency,
        IGroqApiClient groq)
    {
        _grammar = grammar;
        _pronunciation = pronunciation;
        _vocabulary = vocabulary;
        _fluency = fluency;
        _groq = groq;
    }

    public async Task<CoachResponse> ProcessAsync(AnalyzeRequest request, CancellationToken ct = default)
    {
        var text = request.Text;

        // Run all 4 specialist agents concurrently.
        var grammarTask = _grammar.AnalyzeAsync(text, ct);
        var pronunciationTask = _pronunciation.AnalyzeAsync(text, ct);
        var vocabularyTask = _vocabulary.AnalyzeAsync(text, ct);
        var fluencyTask = _fluency.AnalyzeAsync(text, ct);

        await Task.WhenAll(grammarTask, pronunciationTask, vocabularyTask, fluencyTask);

        var grammarResult = grammarTask.Result;
        var pronunciationResult = pronunciationTask.Result;
        var vocabularyResult = vocabularyTask.Result;
        var fluencyResult = fluencyTask.Result;

        // Text mode has no audio, so pronunciation is a *prediction* based on the
        // words used, not an actual measurement. Relabel rather than fabricate
        // false precision, and keep its weight low (see ComputeOverallScore).
        bool isTextMode = request.Mode.Equals("text", StringComparison.OrdinalIgnoreCase);
        if (isTextMode)
        {
            pronunciationResult = pronunciationResult with
            {
                Summary = "Predictive only (no audio in text mode): " + pronunciationResult.Summary
            };
        }

        // Weighted overall score. Speech mode weights pronunciation/fluency higher.
        int overallScore = ComputeOverallScore(request.Mode, grammarResult, pronunciationResult,
            vocabularyResult, fluencyResult);

        // Ask the LLM to synthesize a summary, corrected text, and next exercise.
        var synthesis = await SynthesizeAsync(text, grammarResult, pronunciationResult,
            vocabularyResult, fluencyResult, ct);

        var sessionId = request.SessionId ?? Guid.NewGuid().ToString("N");

        return new CoachResponse(
            SessionId: sessionId,
            OverallScore: overallScore,
            OverallSummary: synthesis.OverallSummary,
            Grammar: grammarResult,
            Pronunciation: pronunciationResult,
            Vocabulary: vocabularyResult,
            Fluency: fluencyResult,
            CorrectedText: synthesis.CorrectedText,
            NextExercise: synthesis.NextExercise
        );
    }

    private static int ComputeOverallScore(
        string mode,
        GrammarResult grammar,
        PronunciationResult pronunciation,
        VocabularyResult vocabulary,
        FluencyResult fluency)
    {
        // Speech mode: pronunciation & fluency matter more.
        // Text mode: pronunciation is less relevant, weight grammar/vocab higher.
        (double g, double p, double v, double f) weights = mode.Equals("speech", StringComparison.OrdinalIgnoreCase)
            ? (0.25, 0.30, 0.15, 0.30)
            : (0.40, 0.05, 0.30, 0.25);

        var score = grammar.Score * weights.g
                   + pronunciation.Score * weights.p
                   + vocabulary.Score * weights.v
                   + fluency.Score * weights.f;

        return (int)Math.Round(score);
    }

    private async Task<(string OverallSummary, string CorrectedText, string NextExercise)> SynthesizeAsync(
        string originalText,
        GrammarResult grammar,
        PronunciationResult pronunciation,
        VocabularyResult vocabulary,
        FluencyResult fluency,
        CancellationToken ct)
    {
        var userPrompt = $"""
            ORIGINAL TEXT:
            "{originalText}"

            GRAMMAR FEEDBACK (score {grammar.Score}/100): {grammar.Summary}
            Issues: {string.Join("; ", grammar.Issues.Select(i => $"'{i.Original}' -> '{i.Corrected}' ({i.Rule})"))}

            PRONUNCIATION FEEDBACK (score {pronunciation.Score}/100): {pronunciation.Summary}
            Words to watch: {string.Join(", ", pronunciation.Issues.Select(i => i.Word))}

            VOCABULARY FEEDBACK (score {vocabulary.Score}/100): {vocabulary.Summary}
            Issues: {string.Join("; ", vocabulary.Issues.Select(i => $"'{i.OriginalWord}' -> {string.Join("/", i.BetterAlternatives)}"))}

            FLUENCY FEEDBACK (score {fluency.Score}/100): {fluency.Summary}
            Fillers found: {string.Join(", ", fluency.FillerWordsFound)}
            Tips: {string.Join("; ", fluency.Tips)}
            """;

        var raw = await _groq.GetChatCompletionAsync(SynthesisSystemPrompt, userPrompt, forceJson: true, ct);
        var parsed = LlmJson.Parse<SynthesisDto>(raw);
        return (parsed.OverallSummary, parsed.CorrectedText, parsed.NextExercise);
    }

    private record SynthesisDto(string OverallSummary, string CorrectedText, string NextExercise);
}