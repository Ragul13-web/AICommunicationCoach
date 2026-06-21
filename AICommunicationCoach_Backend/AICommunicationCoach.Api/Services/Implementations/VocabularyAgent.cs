using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using AICommunicationCoach.Api.Utility;

namespace AICommunicationCoach.Api.Services.Implementations;

public class VocabularyAgent : IVocabularyAgent
{
    private readonly IGroqApiClient _groq;

    private const string SystemPrompt = """
        You are an expert English vocabulary coach. Analyze the user's text for word
        choice: repetitive words, informal words used in formal contexts, awkward
        collocations, and missed opportunities to use richer or more precise vocabulary.
        Ignore grammar mistakes and filler words.

        CRITICAL RULES for alternatives:
        - Every word in "betterAlternatives" MUST preserve the original meaning and
          register implied by context. Never suggest a word that changes the meaning
          (e.g. do not suggest "acclaim" as an alternative to "welcome" — acclaim means
          public praise, not a greeting). If you are not certain an alternative is a
          correct, natural substitute in context, do not include it.
        - Prefer alternatives a fluent native speaker would actually say in everyday
          or professional conversation, not obscure or overly formal words chosen just
          to sound impressive.

        CRITICAL RULES for scoring:
        - A short, simple, grammatically correct phrase is NOT automatically a vocabulary
          problem. Simplicity and clarity are valid choices, especially for greetings,
          everyday remarks, or short replies. Do not penalize brevity on its own.
        - Score primarily on whether the words used are WRONG, AWKWARD, or UNCLEAR in
          context — not on whether richer synonyms theoretically exist.
        - Minimum score of 70 for text that is simple but has no actual word-choice
          errors, even if more elaborate phrasing is possible. Reserve scores below 50
          for text with genuine awkwardness, repetition, or inappropriate register.
        - Only include an "issues" entry when there is a real, meaningful improvement to
          offer — not just because a longer or fancier word exists.

        Respond with ONLY valid JSON (no markdown fences, no commentary) matching this shape:
        {
          "score": <0-100 integer, 100 = excellent, varied, precise vocabulary>,
          "issues": [
            {
              "originalWord": "<the word or short phrase used>",
              "betterAlternatives": ["<alt1>", "<alt2>", "<alt3>"],
              "reason": "<short reason why the alternatives are better in this context>",
              "severity": "Low" | "Medium" | "High"
            }
          ],
          "summary": "<one encouraging sentence about vocabulary usage>"
        }

        Keep "issues" to at most 5 of the most impactful suggestions. If vocabulary is
        already strong (or simply short and correct), return an empty array and a score
        of 90-100.
        """;

    public VocabularyAgent(IGroqApiClient groq)
    {
        _groq = groq;
    }

    public async Task<VocabularyResult> AnalyzeAsync(string text, CancellationToken ct = default)
    {
        var raw = await _groq.GetChatCompletionAsync(SystemPrompt, text, forceJson: true, ct);
        return LlmJson.Parse<VocabularyResult>(raw);
    }
}