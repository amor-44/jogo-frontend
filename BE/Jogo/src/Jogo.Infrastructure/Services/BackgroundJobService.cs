using Hangfire;
using Jogo.Application.Common.Interfaces;
using Jogo.Infrastructure.BackgroundJobs;

namespace Jogo.Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public BackgroundJobService(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public void EnqueueAnalyzeVideoJob(Guid videoId)
    {
        _backgroundJobClient.Enqueue<AnalyzeVideoJob>(job => job.ExecuteAsync(videoId));
    }
}
