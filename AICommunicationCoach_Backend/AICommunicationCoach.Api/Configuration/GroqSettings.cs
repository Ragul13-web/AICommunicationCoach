namespace AICommunicationCoach.Api.Configuration
{
    public class GroqSettings
    {
        public const string SectionName = "GroqSettings";
        public string Apikey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
        public string ModelId { get; set; } = string.Empty;
        public float Temperature { get; set; } = 0.15f;
    }
}
