using System.Text.Json.Serialization;

namespace AICommunicationCoach.Api.Models
{
    public class GroqResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("choices")]
        public List<GroqChoice> Choices { get; set; } = new();
    }

    public class GroqChoice
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("message")]
        public GroqMessage Message { get; set; } = new();

        [JsonPropertyName("finish_reason")]
        public string FinishReason { get; set; } = string.Empty;
    }
}
