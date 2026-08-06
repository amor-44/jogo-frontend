//using Jogo.Application.Common.Interfaces;
//using Jogo.Application.Features.Authentication.Login;
//using Jogo.Domain.Common.Results;
//using Jogo.Domain.Entities;
//using Jogo.Domain.Enums;

//using MediatR;

//using Microsoft.EntityFrameworkCore;

//using Moq;

//using Shouldly;

//using Xunit;

//using MockQueryable.Moq;

//namespace Jogo.UnitTests.Application.Features.Authentication.Login;

//public class LoginCommandHandlerTests
//{
//    private readonly Mock<IIdentityService> _identityServiceMock;
//    private readonly Mock<ITokenProvider> _tokenProviderMock;
//    private readonly Mock<IRefreshTokenService> _refreshTokenServiceMock;
//    private readonly Mock<IAppDbContext> _contextMock;
//    private readonly LoginCommandHandler _handler;

//    public LoginCommandHandlerTests()
//    {
//        _identityServiceMock = new Mock<IIdentityService>();
//        _tokenProviderMock = new Mock<ITokenProvider>();
//        _refreshTokenServiceMock = new Mock<IRefreshTokenService>();
//        _contextMock = new Mock<IAppDbContext>();
//        _handler = new LoginCommandHandler(
//            _identityServiceMock.Object,
//            _tokenProviderMock.Object,
//            _refreshTokenServiceMock.Object,
//            _contextMock.Object);
//    }

//    [Fact]
//    public async Task Handle_ValidCredentials_ReturnsLoginResponse()
//    {
//        var command = new LoginCommand("test@example.com", "Password123");
//        var userId = Guid.NewGuid();
//        var user = new User(userId, Role.Player);
//        var accessToken = "access_token";
//        var refreshToken = "refresh_token";

//        _identityServiceMock.Setup(x => x.CheckCredentialsAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(Result<Guid>.Success(userId));

//        var users = new List<User> { user };
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        _tokenProviderMock.Setup(x => x.GenerateTokens(user))
//            .Returns((accessToken, refreshToken));

//        _refreshTokenServiceMock.Setup(x => x.SaveRefreshTokenAsync(userId, refreshToken, It.IsAny<CancellationToken>()))
//            .Returns(Task.CompletedTask);

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsError.ShouldBeFalse();
//        var response = result.Value;
//        response.ShouldNotBeNull();
//        response.AccessToken.ShouldBe(accessToken);
//        response.RefreshToken.ShouldBe(refreshToken);
//        response.UserId.ShouldBe(userId);
//        response.Role.ShouldBe(user.Role.ToString());

//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
//    }

//    [Fact]
//    public async Task Handle_InvalidCredentials_ReturnsErrors()
//    {
//        var command = new LoginCommand("test@example.com", "wrong");
//        var errors = new List<Error> { Error.Unauthorized("Auth.Invalid", "Invalid credentials") };

//        _identityServiceMock.Setup(x => x.CheckCredentialsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(Result<Guid>.Failure(errors));

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "Auth.Invalid");
//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
//    }

//    [Fact]
//    public async Task Handle_UserNotFound_ReturnsNotFoundError()
//    {
//        var command = new LoginCommand("test@example.com", "Password123");
//        var userId = Guid.NewGuid();

//        _identityServiceMock.Setup(x => x.CheckCredentialsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(Result<Guid>.Success(userId));

//        var users = new List<User>();
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        var result = await _handler.Handle(command, CancellationToken.None);

//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "User.NotFound");
//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
//    }
//}