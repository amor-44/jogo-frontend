namespace Jogo.Application.Common.Interfaces;

public interface IBackgroundJobService
{
    void EnqueueAnalyzeVideoJob(Guid videoId);
}
