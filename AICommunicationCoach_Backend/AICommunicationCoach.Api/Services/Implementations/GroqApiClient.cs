using AICommunicationCoach.Api.Configuration;
using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AICommunicationCoach.Api.Services.Implementations
{
    public class GroqApiClient : IGroqApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly GroqSettings _groqSettings;
        private readonly ILogger<GroqApiClient> _logger;

        public GroqApiClient(HttpClient httpClient,IOptions<GroqSettings> groqSettings, ILogger<GroqApiClient> logger)
        {
            _httpClient = httpClient;
            _groqSettings = groqSettings.Value;
            _logger = logger;

            _httpClient.BaseAddress = new Uri(_groqSettings.BaseUrl);
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _groqSettings.Apikey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
        public async Task<string> GetChatCompletionAsync(
                    string systemPrompt,
                    string userContent,
                    bool forceJson = false,
                    CancellationToken cancellationToken = default)
        {
            try
            {
                // Throws an OperationCanceledException immediately if cancellation was requested before executing
                cancellationToken.ThrowIfCancellationRequested();

                var requestPayload = new GroqRequest
                {
                    Model = _groqSettings.ModelId,
                    Messages = new List<GroqMessage>
                    {
                        new() { Role = "system", Content = systemPrompt },
                        new() { Role = "user", Content = userContent }
                    },
                    Temperature = _groqSettings.Temperature
                };

                if (forceJson)
                {
                    requestPayload.ResponseFormat = new GroqResponseFormat { Type = "json_object" };
                }

                var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var serializedPayload = JsonSerializer.Serialize(requestPayload, jsonOptions);
                var httpContent = new StringContent(serializedPayload, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending prompt request to Groq API using model: {Model}", _groqSettings.ModelId);

                // Pass the token into the network call
                var response = await _httpClient.PostAsync("chat/completions", httpContent, cancellationToken);
                response.EnsureSuccessStatusCode();

                // Pass the token into the response stream consumer as well
                var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
                var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseString);

                return groqResponse?.Choices.FirstOrDefault()?.Message.Content ?? string.Empty;
            }
            catch (OperationCanceledException ex)
            {
                _logger.LogWarning("The request processing pipeline was cancelled by the client upstream." + ex.Message.ToString());
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while calling the Groq API endpoint.");
                throw;
            }
        }
    }
}
