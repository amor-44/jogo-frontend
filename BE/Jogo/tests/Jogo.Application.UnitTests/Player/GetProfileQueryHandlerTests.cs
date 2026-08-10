using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Player.Queries.GetProfile;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace Jogo.Application.UnitTests.Player;

public class GetProfileQueryHandlerTests
{
    private readonly Mock<IAppDbContext> _contextMock;
    private readonly Mock<IUser> _currentUserMock;
    private readonly GetProfileQueryHandler _handler;

    public GetProfileQueryHandlerTests()
    {
        _contextMock = new Mock<IAppDbContext>();
        _currentUserMock = new Mock<IUser>();
        _handler = new GetProfileQueryHandler(_contextMock.Object, _currentUserMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNotFound_WhenProfileDoesNotExist()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile>());

        var result = await _handler.Handle(new GetProfileQuery(), CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("PlayerProfile.NotFound");
    }

    [Fact]
    public async Task Handle_ShouldReturnProfileDto_WhenProfileExists()
    {
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

        var profile = PlayerProfile.Create(userId, "John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA").Value;
        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile> { profile });

        var result = await _handler.Handle(new GetProfileQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.FullName.Should().Be("John");
        result.Value.Country.Should().Be("USA");
    }
}
