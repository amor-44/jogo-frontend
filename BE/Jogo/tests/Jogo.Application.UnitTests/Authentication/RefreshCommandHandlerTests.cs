//using System.Security.Claims;

//using Jogo.Application.Common.Interfaces;
//using Jogo.Application.Features.Authentication.Refresh;
//using Jogo.Domain.Common.Results;
//using Jogo.Domain.Entities;
//using Jogo.Domain.Enums;

//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Logging;

//using MockQueryable;
//using MockQueryable.Moq;

//using Moq;

//using Shouldly;

//using Xunit;

//namespace Jogo.UnitTests.Application.Features.Authentication.Refresh;

//public class RefreshCommandHandlerTests
//{
//    private readonly Mock<ITokenProvider> _tokenProviderMock;
//    private readonly Mock<IRefreshTokenService> _refreshTokenServiceMock;
//    private readonly Mock<IAppDbContext> _contextMock;
//    private readonly Mock<ILogger<RefreshCommandHandler>> _loggerMock;
//    private readonly RefreshCommandHandler _handler;

//    public RefreshCommandHandlerTests()
//    {
//        _tokenProviderMock = new Mock<ITokenProvider>();
//        _refreshTokenServiceMock = new Mock<IRefreshTokenService>();
//        _contextMock = new Mock<IAppDbContext>();
//        _loggerMock = new Mock<ILogger<RefreshCommandHandler>>();
//        _handler = new RefreshCommandHandler(
//            _tokenProviderMock.Object,
//            _refreshTokenServiceMock.Object,
//            _contextMock.Object,
//            _loggerMock.Object);
//    }

//    [Fact]
//    public async Task Handle_ValidTokens_ReturnsNewTokens()
//    {
//        // Arrange
//        var userId = Guid.NewGuid();
//        var accessToken = "expired_access_token";
//        var refreshToken = "valid_refresh_token";
//        var newAccessToken = "new_access_token";
//        var newRefreshToken = "new_refresh_token";
//        var user = new User(userId, Role.Player);

//        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
//        {
//            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
//        }));

//        _tokenProviderMock.Setup(x => x.GetPrincipalFromExpiredToken(accessToken))
//            .Returns(principal);

//        var users = new List<User> { user };
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        _refreshTokenServiceMock.Setup(x => x.GetRefreshTokenAsync(userId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(refreshToken);

//        _tokenProviderMock.Setup(x => x.GenerateTokens(user))
//            .Returns((newAccessToken, newRefreshToken));

//        _refreshTokenServiceMock.Setup(x => x.SaveRefreshTokenAsync(userId, newRefreshToken, It.IsAny<CancellationToken>()))
//            .Returns(Task.CompletedTask);

//        var command = new RefreshCommand(accessToken, refreshToken);

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeFalse();
//        var response = result.Value;
//        response.AccessToken.ShouldBe(newAccessToken);
//        response.RefreshToken.ShouldBe(newRefreshToken);
//        _refreshTokenServiceMock.Verify(x => x.SaveRefreshTokenAsync(userId, newRefreshToken, It.IsAny<CancellationToken>()), Times.Once);
//    }

//    [Fact]
//    public async Task Handle_InvalidAccessToken_ReturnsUnauthorized()
//    {
//        // Arrange
//        var command = new RefreshCommand("invalid_token", "refresh");

//        _tokenProviderMock.Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>()))
//            .Throws(new Exception("Invalid token"));

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "AccessToken.Invalid");
//        _loggerMock.Verify(l => l.Log(LogLevel.Warning, It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()), Times.Once);
//    }

//    [Fact]
//    public async Task Handle_PrincipalWithoutUserId_ReturnsUnauthorized()
//    {
//        // Arrange
//        var principal = new ClaimsPrincipal(new ClaimsIdentity());
//        _tokenProviderMock.Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>()))
//            .Returns(principal);

//        var command = new RefreshCommand("access", "refresh");

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "AccessToken.InvalidClaims");
//    }

//    [Fact]
//    public async Task Handle_UserNotFound_ReturnsNotFound()
//    {
//        // Arrange
//        var userId = Guid.NewGuid();
//        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
//        {
//            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
//        }));
//        _tokenProviderMock.Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>()))
//            .Returns(principal);

//        var users = new List<User>(); // فارغ
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        var command = new RefreshCommand("access", "refresh");

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "User.NotFound");
//    }

//    [Fact]
//    public async Task Handle_RefreshTokenMismatch_ReturnsUnauthorized()
//    {
//        // Arrange
//        var userId = Guid.NewGuid();
//        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
//        {
//            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
//        }));
//        _tokenProviderMock.Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>()))
//            .Returns(principal);

//        var user = new User(userId, Role.Player);
//        var users = new List<User> { user };
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        _refreshTokenServiceMock.Setup(x => x.GetRefreshTokenAsync(userId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync("saved_refresh");

//        var command = new RefreshCommand("access", "different_refresh");

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "RefreshToken.Invalid");
//    }
//}