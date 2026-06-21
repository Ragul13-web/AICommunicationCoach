using System.Text.Json.Serialization;

namespace AICommunicationCoach.Api.Models
{
    public class GroqRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("messages")]
        public List<GroqMessage> Messages { get; set; } = new();

        [JsonPropertyName("temperature")]
        public float Temperature { get; set; } = 0.5f;

        [JsonPropertyName("response_format")]
        public GroqResponseFormat? ResponseFormat { get; set; }
    }

    public class GroqMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    public class GroqResponseFormat
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "json_object";
    }
}
