namespace AICommunicationCoach.Api.Services.Interfaces
{
    public interface IGroqApiClient
    {
        Task<string> GetChatCompletionAsync(string systemPrompt, string userContent, bool forceJson = false, CancellationToken cancellationToken = default);
    }
}
