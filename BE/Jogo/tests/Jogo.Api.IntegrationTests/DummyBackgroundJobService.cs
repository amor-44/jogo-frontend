using System;
using System.Threading;
using System.Threading.Tasks;
using Jogo.Application.Common.Interfaces;

namespace Jogo.Api.IntegrationTests;

public class DummyBackgroundJobService : IBackgroundJobService
{
    public void EnqueueAnalyzeVideoJob(Guid videoId)
    {
    }
}
