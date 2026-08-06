//using FluentAssertions;
//using Jogo.Application.Common.Interfaces;
//using Jogo.Application.Features.Player.CreateProfile;
//using Jogo.Domain.Entities;
//using Jogo.Domain.Enums;
//using Moq;
//using Moq.EntityFrameworkCore;
//using Xunit;

//namespace Jogo.Application.UnitTests.Player;

//public class CreateProfileCommandHandlerTests
//{
//    private readonly Mock<IAppDbContext> _contextMock;
//    private readonly Mock<IUser> _currentUserMock;
//    private readonly CreateProfileCommandHandler _handler;

//    public CreateProfileCommandHandlerTests()
//    {
//        _contextMock = new Mock<IAppDbContext>();
//        _currentUserMock = new Mock<IUser>();
//        _handler = new CreateProfileCommandHandler(_contextMock.Object, _currentUserMock.Object);
//    }

//    [Fact]
//    public async Task Handle_ShouldReturnUnauthorized_WhenUserIdIsEmpty()
//    {
//        _currentUserMock.Setup(x => x.Id).Returns(string.Empty);
//        var command = new CreateProfileCommand("John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA");

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsError.Should().BeTrue();
//        result.TopError.Code.Should().Be("PlayerProfile.Unauthorized");
//    }

//    [Fact]
//    public async Task Handle_ShouldReturnConflict_WhenProfileAlreadyExists()
//    {
//        var userId = Guid.NewGuid();
//        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

//        var profiles = new List<PlayerProfile>
//        {
//            PlayerProfile.Create(userId, "John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA").Value
//        };

//        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(profiles);

//        var command = new CreateProfileCommand("John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA");

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsError.Should().BeTrue();
//        result.TopError.Code.Should().Be("PlayerProfile.AlreadyExists");
//    }

//    [Fact]
//    public async Task Handle_ShouldReturnSuccess_WhenProfileIsValidAndDoesNotAlreadyExist()
//    {
//        var userId = Guid.NewGuid();
//        _currentUserMock.Setup(x => x.Id).Returns(userId.ToString());

//        _contextMock.Setup(x => x.PlayerProfiles).ReturnsDbSet(new List<PlayerProfile>());

//        var command = new CreateProfileCommand("John", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA");

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsSuccess.Should().BeTrue();
//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
//    }
//}
