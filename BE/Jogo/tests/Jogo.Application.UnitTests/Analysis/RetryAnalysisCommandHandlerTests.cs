using FluentAssertions;
using Xunit;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Analysis.RetryAnalysis;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;

namespace Jogo.Application.UnitTests.Analysis;

public class RetryAnalysisCommandHandlerTests
{
    private readonly Mock<IAppDbContext> _contextMock;
    private readonly Mock<IUser> _currentUserMock;
    private readonly Mock<IBackgroundJobService> _backgroundJobServiceMock;
    private readonly RetryAnalysisCommandHandler _handler;

    public RetryAnalysisCommandHandlerTests()
    {
        _contextMock = new Mock<IAppDbContext>();
        _currentUserMock = new Mock<IUser>();
        _backgroundJobServiceMock = new Mock<IBackgroundJobService>();
        _handler = new RetryAnalysisCommandHandler(_contextMock.Object, _currentUserMock.Object, _backgroundJobServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenValidRequest_RetriesAndReturnsSuccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(u => u.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "Test", DateTime.UtcNow.AddYears(-20), Position.Striker, PreferredFoot.Right, "Country").Value;
        var profiles = new List<PlayerProfile> { profile };
        _contextMock.Setup(c => c.PlayerProfiles).ReturnsDbSet(profiles);

        var video = FootballVideo.Upload(profile.Id, "http://url", "test.mp4", TimeSpan.FromMinutes(1)).Value;
        var videoId = video.Id;

        // Move to failed state to allow retry
        video.MarkQueued();
        video.MarkProcessing();
        video.MarkFailed();

        var videos = new List<FootballVideo> { video };
        _contextMock.Setup(c => c.FootballVideos).ReturnsDbSet(videos);

        var command = new RetryAnalysisCommand { VideoId = videoId };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        video.Status.Should().Be(VideoAnalysisStatus.Queued);
        _backgroundJobServiceMock.Verify(b => b.EnqueueAnalyzeVideoJob(videoId), Times.Once);
        _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
