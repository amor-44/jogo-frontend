using FluentAssertions;
using Jogo.Domain.Entities;
using Xunit;

namespace Jogo.Domain.UnitTests;

public class RefreshTokenTests
{
    [Fact]
    public void Issue_WithValidInputs_ShouldCreateToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tokenHash = "dummyHash";
        var expiry = DateTimeOffset.UtcNow.AddDays(7);

        // Act
        var result = RefreshToken.Issue(userId, tokenHash, expiry);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.UserId.Should().Be(userId);
        result.Value.TokenHash.Should().Be(tokenHash);
        result.Value.ExpiresAt.Should().Be(expiry);
        result.Value.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Issue_WithEmptyUserId_ShouldReturnError()
    {
        // Act
        var result = RefreshToken.Issue(Guid.Empty, "hash", DateTimeOffset.UtcNow.AddDays(1));

        // Assert
        result.IsError.Should().BeTrue();
        result.TopErrors.Should().Contain(e => e.Code == "RefreshToken.EmptyUserId");
    }

    [Fact]
    public void Issue_WithEmptyTokenHash_ShouldReturnError()
    {
        // Act
        var result = RefreshToken.Issue(Guid.NewGuid(), "", DateTimeOffset.UtcNow.AddDays(1));

        // Assert
        result.IsError.Should().BeTrue();
        result.TopErrors.Should().Contain(e => e.Code == "RefreshToken.EmptyHash");
    }

    [Fact]
    public void Revoke_WhenActive_ShouldRevokeToken()
    {
        // Arrange
        var token = RefreshToken.Issue(Guid.NewGuid(), "hash", DateTimeOffset.UtcNow.AddDays(1)).Value;

        // Act
        var result = token.Revoke();

        // Assert
        result.IsSuccess.Should().BeTrue();
        token.IsActive.Should().BeFalse();
        token.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public void Revoke_WhenAlreadyRevoked_ShouldReturnError()
    {
        // Arrange
        var token = RefreshToken.Issue(Guid.NewGuid(), "hash", DateTimeOffset.UtcNow.AddDays(1)).Value;
        token.Revoke();

        // Act
        var result = token.Revoke();

        // Assert
        result.IsError.Should().BeTrue();
        result.TopErrors.Should().Contain(e => e.Code == "RefreshToken.AlreadyRevoked");
    }

    [Fact]
    public void IsActive_WhenExpired_ShouldBeFalse()
    {
        // Arrange
        var token = RefreshToken.Issue(Guid.NewGuid(), "hash", DateTimeOffset.UtcNow.AddDays(-1)).Value;

        // Assert
        token.IsActive.Should().BeFalse();
    }
}
