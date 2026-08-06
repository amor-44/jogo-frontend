using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Player.UploadProfileImage;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace Jogo.Application.UnitTests.Player;

public class UploadProfileImageCommandHandlerTests
{
    private readonly Mock<IAppDbContext> _contextMock;
    private readonly Mock<IUser> _currentUserMock;
    private readonly Mock<IFileStorageService> _fileStorageMock;
    private readonly UploadProfileImageCommandHandler _handler;

    public UploadProfileImageCommandHandlerTests()
    {
        _contextMock = new Mock<IAppDbContext>();
        _currentUserMock = new Mock<IUser>();
        _fileStorageMock = new Mock<IFileStorageService>();
        _handler = new UploadProfileImageCommandHandler(_contextMock.Object, _currentUserMock.Object, _fileStorageMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnValidation_WhenFileTypeIsInvalid()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA").Value;
        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile> { profile });

        var command = new UploadProfileImageCommand(Stream.Null, "test.pdf", "application/pdf");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("PlayerProfile.InvalidImageType");
    }

    [Fact]
    public async Task Handle_ShouldUploadAndSave_WhenImageIsValid()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA").Value;
        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile> { profile });

        _fileStorageMock
            .Setup(x => x.UploadFileAsync(It.IsAny<Stream>(), "test.png", "image/png", It.IsAny<CancellationToken>()))
            .ReturnsAsync("/uploads/test.png");

        var command = new UploadProfileImageCommand(Stream.Null, "test.png", "image/png");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("/uploads/test.png");
        profile.ProfilePictureUrl.Should().Be("/uploads/test.png");
        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
