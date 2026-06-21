using System.Text.Json;
using System.Text.Json.Serialization;

namespace AICommunicationCoach.Api.Utility
{
    internal static class LlmJson
    {
        public static readonly JsonSerializerOptions Options = new()
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        public static T Parse<T>(string raw)
        {
            var cleaned = Clean(raw);
            try
            {
                return JsonSerializer.Deserialize<T>(cleaned, Options)
                       ?? throw new InvalidOperationException("Deserialized to null");
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException(
                    $"Failed to parse LLM JSON response. Raw content:\n{raw}", ex);
            }
        }

        private static string Clean(string raw)
        {
            var text = raw.Trim();

            // Strip ```json ... ``` or ``` ... ``` fences
            if (text.StartsWith("```"))
            {
                var firstNewline = text.IndexOf('\n');
                if (firstNewline != -1) text = text[(firstNewline + 1)..];
                var lastFence = text.LastIndexOf("```", StringComparison.Ordinal);
                if (lastFence != -1) text = text[..lastFence];
            }

            // If there's leading/trailing prose, extract the outermost {...}
            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            if (start >= 0 && end > start)
            {
                text = text[start..(end + 1)];
            }

            return text.Trim();
        }
    }

}
