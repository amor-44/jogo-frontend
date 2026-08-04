using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.Refresh;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Xunit;

namespace Jogo.Application.UnitTests.Authentication;

public class RefreshCommandHandlerTests
{
    private readonly Mock<ITokenProvider> _tokenProviderMock;
    private readonly Mock<IAppDbContext> _dbContextMock;
    private readonly RefreshCommandHandler _handler;

    public RefreshCommandHandlerTests()
    {
        _tokenProviderMock = new Mock<ITokenProvider>();
        _dbContextMock = new Mock<IAppDbContext>();
        _handler = new RefreshCommandHandler(_tokenProviderMock.Object, _dbContextMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidToken_ShouldIssueNewTokens()
    {
        // Arrange
        var command = new RefreshCommand("oldRefreshToken");
        var userId = Guid.NewGuid();
        var user = User.Create(userId, Jogo.Domain.Enums.Role.Player).Value;

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(command.RefreshToken));
        var hashedToken = Convert.ToBase64String(hashBytes);

        var existingToken = RefreshToken.Issue(userId, hashedToken, DateTimeOffset.UtcNow.AddDays(7)).Value;

        _dbContextMock.Setup(c => c.RefreshTokens).ReturnsDbSet(new List<RefreshToken> { existingToken });
        _dbContextMock.Setup(c => c.Users).ReturnsDbSet(new List<User> { user });

        var newAccessToken = "newAccessToken";
        var newRefreshToken = "newRefreshToken";

        _tokenProviderMock.Setup(t => t.GenerateAccessToken(userId, "Player")).Returns(newAccessToken);
        _tokenProviderMock.Setup(t => t.GenerateRefreshToken()).Returns(newRefreshToken);

        _dbContextMock.Setup(c => c.RefreshTokens.Add(It.IsAny<RefreshToken>()));
        _dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be(newAccessToken);
        result.Value.RefreshToken.Should().Be(newRefreshToken);

        existingToken.IsActive.Should().BeFalse();
        existingToken.RevokedAt.Should().NotBeNull();
        
        _dbContextMock.Verify(c => c.RefreshTokens.Add(It.IsAny<RefreshToken>()), Times.Once);
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidToken_ShouldReturnError()
    {
        // Arrange
        var command = new RefreshCommand("invalidToken");

        _dbContextMock.Setup(c => c.RefreshTokens).ReturnsDbSet(new List<RefreshToken>()); // Not found

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsError.Should().BeTrue();
        result.TopErrors.Should().Contain(e => e.Code == "RefreshToken.Invalid");
    }
}
