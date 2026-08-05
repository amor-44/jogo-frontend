using FluentAssertions;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Xunit;

namespace Jogo.Domain.UnitTests;

public class UserTests
{
    [Fact]
    public void Create_WithValidInputs_ShouldCreateUser()
    {
        // Arrange
        var id = Guid.NewGuid();
        var role = Role.Player;

        // Act
        var result = User.Create(id, role);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(id);
        result.Value.Role.Should().Be(role);
        result.Value.Status.Should().Be(AccountStatus.Active);
    }

    [Fact]
    public void Create_WithEmptyId_ShouldReturnError()
    {
        // Act
        var result = User.Create(Guid.Empty, Role.Player);

        // Assert
        result.IsError.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Code == "User.InvalidId");
    }

    [Fact]
    public void RecordLogin_ShouldUpdateLastLoginAt()
    {
        // Arrange
        var user = User.Create(Guid.NewGuid(), Role.Player).Value;
        var initialLastLogin = user.LastLoginAt;

        // Act
        user.RecordLogin();

        // Assert
        user.LastLoginAt.Should().NotBeNull();
        user.LastLoginAt.Should().BeAfter(initialLastLogin ?? DateTimeOffset.MinValue);
    }

    [Fact]
    public void Suspend_ShouldChangeStatusToSuspended()
    {
        var user = User.Create(Guid.NewGuid(), Role.Player).Value;

        var result = user.Suspend();

        result.IsSuccess.Should().BeTrue();
        user.Status.Should().Be(AccountStatus.Suspended);
    }

    [Fact]
    public void Reactivate_ShouldChangeStatusToActive()
    {
        var user = User.Create(Guid.NewGuid(), Role.Player).Value;
        user.Suspend();

        var result = user.Reactivate();

        result.IsSuccess.Should().BeTrue();
        user.Status.Should().Be(AccountStatus.Active);
    }
}
