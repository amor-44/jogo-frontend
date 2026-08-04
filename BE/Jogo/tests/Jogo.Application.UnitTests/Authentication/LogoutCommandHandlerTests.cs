using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.Logout;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Xunit;

namespace Jogo.Application.UnitTests.Authentication;

public class LogoutCommandHandlerTests
{
    private readonly Mock<IAppDbContext> _dbContextMock;
    private readonly LogoutCommandHandler _handler;

    public LogoutCommandHandlerTests()
    {
        _dbContextMock = new Mock<IAppDbContext>();
        _handler = new LogoutCommandHandler(_dbContextMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidToken_ShouldRevokeToken()
    {
        // Arrange
        var command = new LogoutCommand("validRefreshToken");
        var userId = Guid.NewGuid();

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(command.RefreshToken));
        var hashedToken = Convert.ToBase64String(hashBytes);

        var existingToken = RefreshToken.Issue(userId, hashedToken, DateTimeOffset.UtcNow.AddDays(7)).Value;

        _dbContextMock.Setup(c => c.RefreshTokens).ReturnsDbSet(new List<RefreshToken> { existingToken });
        _dbContextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        existingToken.IsActive.Should().BeFalse();
        
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithUnknownToken_ShouldSucceedIdempotently()
    {
        // Arrange
        var command = new LogoutCommand("unknownToken");
        
        _dbContextMock.Setup(c => c.RefreshTokens).ReturnsDbSet(new List<RefreshToken>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
