using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using AICommunicationCoach.Api.Utility;

namespace AICommunicationCoach.Api.Services.Implementations;

public class FluencyAgent : IFluencyAgent
{
    private readonly IGroqApiClient _groq;

    private const string SystemPrompt = """
        You are an expert English fluency coach. Analyze the user's text for fluency:
        filler words ("um", "uh", "like", "you know", "actually" overuse), run-on or
        choppy sentences, repetition, awkward transitions, and overall flow/coherence.
        Ignore grammar correctness and vocabulary word choice unless it affects flow.

        Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:
        {
          "score": <0-100 integer, 100 = very fluent and coherent>,
          "fillerWordsFound": ["<filler1>", "<filler2>"],
          "tips": ["<short actionable tip>", "<short actionable tip>"],
          "summary": "<one encouraging sentence about overall fluency>"
        }

        Keep "fillerWordsFound" to actual fillers present in the text (empty array if
        none). Keep "tips" to at most 3, concise and actionable.
        """;

    public FluencyAgent(IGroqApiClient groq)
    {
        _groq = groq;
    }

    public async Task<FluencyResult> AnalyzeAsync(string text, CancellationToken ct = default)
    {
        var raw = await _groq.GetChatCompletionAsync(SystemPrompt, text, forceJson: true, ct);
        return LlmJson.Parse<FluencyResult>(raw);
    }
}