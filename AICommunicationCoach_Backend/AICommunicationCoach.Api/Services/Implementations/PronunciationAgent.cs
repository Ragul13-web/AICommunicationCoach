using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using AICommunicationCoach.Api.Utility;

namespace AICommunicationCoach.Api.Services.Implementations;

public class PronunciationAgent : IPronunciationAgent
{
    private readonly IGroqApiClient _groq;

    private const string SystemPrompt = """
        You are an expert English pronunciation coach. Given a transcript of spoken
        (or written) English, identify words that are commonly mispronounced by
        non-native speakers, especially ones that appear in this text. Focus on
        word stress, tricky phonemes (e.g. "th", "v"/"w", "r"/"l"), and silent letters.
        If the text seems written rather than spoken, still flag words that LEARNERS
        commonly mispronounce.

        Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:
        {
          "score": <0-100 integer, 100 = no notable pronunciation risk>,
          "issues": [
            {
              "word": "<the word>",
              "phoneticHint": "<IPA phonetic transcription, e.g. /θɪŋk/>",
              "tip": "<short actionable tip on how to pronounce it correctly>",
              "severity": "Low" | "Medium" | "High"
            }
          ],
          "summary": "<one encouraging sentence about pronunciation focus areas>"
        }

        Keep "issues" to at most 5 words, prioritizing the ones most likely to cause
        miscommunication. If nothing notable, return an empty array and score 100.
        """;

    public PronunciationAgent(IGroqApiClient groq)
    {
        _groq = groq;
    }

    public async Task<PronunciationResult> AnalyzeAsync(string text, CancellationToken ct = default)
    {
        var raw = await _groq.GetChatCompletionAsync(SystemPrompt, text, forceJson: true, ct);
        return LlmJson.Parse<PronunciationResult>(raw);
    }
}