using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Player.Commands.UpdateProfile;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace Jogo.Application.UnitTests.Player;

public class UpdateProfileCommandHandlerTests
{
    private readonly Mock<IAppDbContext> _contextMock;
    private readonly Mock<IUser> _currentUserMock;
    private readonly Mock<Microsoft.Extensions.Caching.Hybrid.HybridCache> _hybridCacheMock;
    private readonly UpdateProfileCommandHandler _handler;

    public UpdateProfileCommandHandlerTests()
    {
        _contextMock = new Mock<IAppDbContext>();
        _currentUserMock = new Mock<IUser>();
        _hybridCacheMock = new Mock<Microsoft.Extensions.Caching.Hybrid.HybridCache>();
        _handler = new UpdateProfileCommandHandler(_contextMock.Object, _currentUserMock.Object, _hybridCacheMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenProfileDoesNotExist()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile>());

        var command = new UpdateProfileCommand(null, null, null, null, null, null, null, null, ProfileVisibility.Public);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("PlayerProfile.NotFound");
    }

    [Fact]
    public async Task Handle_ShouldReturnSuccess_WhenProfileIsValid()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA").Value;
        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile> { profile });

        var command = new UpdateProfileCommand("NY", 180, 75, Position.LeftWinger, "NYFC", "Hi", "2 years", 1000m, ProfileVisibility.Public);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        profile.City.Should().Be("NY");
        profile.Height.Should().Be(180);
        profile.Weight.Should().Be(75);
        profile.Visibility.Should().Be(ProfileVisibility.Public);
        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _hybridCacheMock.Verify(x => x.RemoveByTagAsync("players", It.IsAny<CancellationToken>()), Times.Once);
    }
}
