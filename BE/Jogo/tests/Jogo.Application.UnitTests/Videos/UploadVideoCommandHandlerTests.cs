using System.Security.Cryptography;
using System.Text;
using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Videos.Commands.UploadVideo;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace Jogo.Application.UnitTests.Videos;

public class UploadVideoCommandHandlerTests
{
    private readonly Mock<IAppDbContext> _contextMock;
    private readonly Mock<IUser> _currentUserMock;
    private readonly Mock<IVideoStorageService> _videoStorageMock;
    private readonly UploadVideoCommandHandler _handler;

    public UploadVideoCommandHandlerTests()
    {
        _contextMock = new Mock<IAppDbContext>();
        _currentUserMock = new Mock<IUser>();
        _videoStorageMock = new Mock<IVideoStorageService>();

        var options = Options.Create(new VideoSettings
        {
            AllowedFormats = new List<string> { ".mp4", ".mov" },
            MaxSizeBytes = 104857600
        });

        _handler = new UploadVideoCommandHandler(
            _contextMock.Object,
            _currentUserMock.Object,
            _videoStorageMock.Object,
            options);
    }

    [Fact]
    public async Task Handle_UnauthorizedUser_ReturnsError()
    {
        _currentUserMock.Setup(u => u.Id).Returns((string)null);

        var command = new UploadVideoCommand(new MemoryStream(), "test.mp4", "video/mp4");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("UploadVideo.Unauthorized");
    }

    [Fact]
    public async Task Handle_ProfileIncomplete_ReturnsError()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(u => u.Id).Returns(userId.ToString());

        // Incomplete profile (missing country)
        var profile = PlayerProfile.Create(userId, "Test Player", DateTime.Today.AddYears(-20), Position.Striker, PreferredFoot.Right, "Country").Value;
        typeof(PlayerProfile).GetProperty("Country")!.SetValue(profile, "");

        var profiles = new List<PlayerProfile> { profile };
        _contextMock.Setup(c => c.PlayerProfiles).ReturnsDbSet(profiles);

        var command = new UploadVideoCommand(new MemoryStream(), "test.mp4", "video/mp4");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("UploadVideo.ProfileIncomplete");
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsGuid()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(u => u.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "Test Player", DateTime.Today.AddYears(-20), Position.Striker, PreferredFoot.Right, "Country").Value;

        var profiles = new List<PlayerProfile> { profile };
        _contextMock.Setup(c => c.PlayerProfiles).ReturnsDbSet(profiles);

        var videos = new List<FootballVideo>();
        _contextMock.Setup(c => c.FootballVideos).ReturnsDbSet(videos);

        _videoStorageMock.Setup(v => v.UploadVideoAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("/uploads/videos/test.mp4");

        _videoStorageMock.Setup(v => v.GetVideoDurationAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(TimeSpan.FromSeconds(60));

        var command = new UploadVideoCommand(new MemoryStream(), "test.mp4", "video/mp4");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        
        _contextMock.Verify(c => c.FootballVideos.Add(It.IsAny<FootballVideo>()), Times.Once);
        _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
