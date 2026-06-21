namespace AICommunicationCoach.Api.Models
{
    public record AnalyzeRequest(
        string Text,                 // transcript (speech mode) or typed text
        string Mode,                 // "speech" | "text"
        string? SessionId = null,    // reuse to keep conversation context (future use)
        string? Context = null       // optional topic, e.g. "job interview practice"
    );

    // ─── Shared enum ───────────────────────────────────────────────────────────

    public enum Severity { Low, Medium, High }

    // ─── Individual agent results ─────────────────────────────────────────────

    public record GrammarIssue(string Original, string Corrected, string Rule, Severity Severity);

    public record GrammarResult(int Score, List<GrammarIssue> Issues, string Summary);

    public record PronunciationIssue(string Word, string PhoneticHint, string Tip, Severity Severity);

    public record PronunciationResult(int Score, List<PronunciationIssue> Issues, string Summary);

    public record VocabularyIssue(string OriginalWord, List<string> BetterAlternatives, string Reason, Severity Severity);

    public record VocabularyResult(int Score, List<VocabularyIssue> Issues, string Summary);

    public record FluencyResult(int Score, List<string> FillerWordsFound, List<string> Tips, string Summary);

    // ─── Final synthesized response ───────────────────────────────────────────

    public record CoachResponse(
        string SessionId,
        int OverallScore,
        string OverallSummary,
        GrammarResult Grammar,
        PronunciationResult Pronunciation,
        VocabularyResult Vocabulary,
        FluencyResult Fluency,
        string CorrectedText,
        string NextExercise
    );
}
