using AICommunicationCoach.Api.Models;

namespace AICommunicationCoach.Api.Services.Interfaces
{
    public interface IGrammarAgent
    {
        Task<GrammarResult> AnalyzeAsync(string text, CancellationToken ct = default);
    }

    public interface IPronunciationAgent
    {
        Task<PronunciationResult> AnalyzeAsync(string text, CancellationToken ct = default);
    }

    public interface IVocabularyAgent
    {
        Task<VocabularyResult> AnalyzeAsync(string text, CancellationToken ct = default);
    }

    public interface IFluencyAgent
    {
        Task<FluencyResult> AnalyzeAsync(string text, CancellationToken ct = default);
    }

    public interface IOrchestratorService
    {
        Task<CoachResponse> ProcessAsync(AnalyzeRequest request, CancellationToken ct = default);
    }
}
