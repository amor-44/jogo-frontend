using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.Register;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Moq;
using Xunit;

namespace Jogo.Application.UnitTests.Authentication;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IIdentityService> _identityServiceMock;
    private readonly Mock<IAppDbContext> _dbContextMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _identityServiceMock = new Mock<IIdentityService>();
        _dbContextMock = new Mock<IAppDbContext>();
        _handler = new RegisterCommandHandler(_identityServiceMock.Object, _dbContextMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidInputs_ShouldReturnUserId()
    {
        // Arrange
        var command = new RegisterCommand("test@test.com", "Password123!", "Player");
        var expectedUserId = Guid.NewGuid();

        _identityServiceMock
            .Setup(s => s.RegisterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedUserId);

        _dbContextMock.Setup(c => c.Users.Add(It.IsAny<User>()));
        _dbContextMock
            .Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(expectedUserId);
        
        _dbContextMock.Verify(c => c.Users.Add(It.Is<User>(u => u.Id == expectedUserId && u.Role == Jogo.Domain.Enums.Role.Player)), Times.Once);
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenIdentityServiceFails_ShouldReturnError()
    {
        // Arrange
        var command = new RegisterCommand("test@test.com", "Password123!", "Player");
        var error = Error.Validation("Email.InUse", "Email is in use");

        _identityServiceMock
            .Setup(s => s.RegisterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(error);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsError.Should().BeTrue();
        result.Errors.Should().Contain(e => e.Code == "Email.InUse");
        
        _dbContextMock.Verify(c => c.Users.Add(It.IsAny<User>()), Times.Never);
        _dbContextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
