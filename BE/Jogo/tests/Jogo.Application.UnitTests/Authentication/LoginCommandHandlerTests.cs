using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.Login;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace Jogo.Application.UnitTests.Authentication;

public class LoginCommandHandlerTests
{
    private readonly Mock<IIdentityService> _identityServiceMock;
    private readonly Mock<ITokenProvider> _tokenProviderMock;
    private readonly Mock<IAppDbContext> _dbContextMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _identityServiceMock = new Mock<IIdentityService>();
        _tokenProviderMock = new Mock<ITokenProvider>();
        _dbContextMock = new Mock<IAppDbContext>();
        _handler = new LoginCommandHandler(_identityServiceMock.Object, _tokenProviderMock.Object, _dbContextMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidInputs_ShouldReturnTokens()
    {
        // Arrange
        var command = new LoginCommand("test@test.com", "Password123!");
        var userId = Guid.NewGuid();
        var user = User.Create(userId, Role.Player).Value;

        var accessToken = "accessToken";
        var refreshTokenString = "refreshToken";

        _identityServiceMock
            .Setup(s => s.CheckCredentialsAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        _dbContextMock.Setup(c => c.Users).ReturnsDbSet(new List<User> { user });

        _tokenProviderMock.Setup(t => t.GenerateAccessToken(userId, "Player")).Returns(accessToken);
        _tokenProviderMock.Setup(t => t.GenerateRefreshToken()).Returns(refreshTokenString);

        _dbContextMock.Setup(c => c.RefreshTokens.Add(It.IsAny<RefreshToken>()));
        _dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be(accessToken);
        result.Value.RefreshToken.Should().Be(refreshTokenString);

        user.LastLoginAt.Should().NotBeNull();
        _dbContextMock.Verify(c => c.RefreshTokens.Add(It.IsAny<RefreshToken>()), Times.Once);
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCredentialsInvalid_ShouldReturnError()
    {
        // Arrange
        var command = new LoginCommand("test@test.com", "Password123!");
        var error = Error.Unauthorized("Identity.InvalidCredentials", "Invalid email or password.");

        _identityServiceMock
            .Setup(s => s.CheckCredentialsAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(error);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsError.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Code == "Identity.InvalidCredentials");
    }

    [Fact]
    public async Task Handle_WhenUserNotFoundInDomain_ShouldReturnError()
    {
        // Arrange
        var command = new LoginCommand("test@test.com", "Password123!");
        var userId = Guid.NewGuid();

        _identityServiceMock
            .Setup(s => s.CheckCredentialsAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        _dbContextMock.Setup(c => c.Users).ReturnsDbSet(new List<User>()); // Empty list

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsError.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Code == "User.NotFound");
    }
}
