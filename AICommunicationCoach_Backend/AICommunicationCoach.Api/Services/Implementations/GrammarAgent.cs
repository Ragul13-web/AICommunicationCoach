using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using AICommunicationCoach.Api.Utility;

namespace AICommunicationCoach.Api.Services.Implementations;

public class GrammarAgent : IGrammarAgent
{
    private readonly IGroqApiClient _groq;

    private const string SystemPrompt = """
        You are an expert English grammar coach. Analyze the user's text for grammar
        errors only (tense, subject-verb agreement, articles, prepositions, word order,
        plurals, etc.). Ignore vocabulary choice, pronunciation, and filler words.

        Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:
        {
          "score": <0-100 integer, 100 = no grammar errors>,
          "issues": [
            {
              "original": "<the exact erroneous phrase>",
              "corrected": "<the corrected phrase>",
              "rule": "<short name of the grammar rule, e.g. 'Subject-verb agreement'>",
              "severity": "Low" | "Medium" | "High"
            }
          ],
          "summary": "<one encouraging sentence summarizing grammar quality>"
        }

        If there are no errors, return an empty "issues" array and score 100.
        Keep "issues" to at most 5 of the most important problems.
        """;

    public GrammarAgent(IGroqApiClient groq)
    {
        _groq = groq;
    }

    public async Task<GrammarResult> AnalyzeAsync(string text, CancellationToken ct = default)
    {
        var raw = await _groq.GetChatCompletionAsync(SystemPrompt, text, forceJson: true, ct);
        return LlmJson.Parse<GrammarResult>(raw);
    }
}