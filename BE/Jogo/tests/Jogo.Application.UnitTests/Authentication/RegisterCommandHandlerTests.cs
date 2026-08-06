//using Jogo.Application.Common.Interfaces;
//using Jogo.Application.Features.Authentication.Register;
//using Jogo.Domain.Common.Results;
//using Jogo.Domain.Entities;
//using Jogo.Domain.Enums;

//using Microsoft.EntityFrameworkCore;

//using MockQueryable;
//using MockQueryable.Moq;

//using Moq;

//using Shouldly;

//using Xunit;

//namespace Jogo.UnitTests.Application.Features.Authentication.Register;

//public class RegisterCommandHandlerTests
//{
//    private readonly Mock<IIdentityService> _identityServiceMock;
//    private readonly Mock<IAppDbContext> _contextMock;
//    private readonly RegisterCommandHandler _handler;

//    public RegisterCommandHandlerTests()
//    {
//        _identityServiceMock = new Mock<IIdentityService>();
//        _contextMock = new Mock<IAppDbContext>();
//        _handler = new RegisterCommandHandler(
//            _identityServiceMock.Object,
//            _contextMock.Object);
//    }

//    [Fact]
//    public async Task Handle_ValidRegistration_ReturnsUserId()
//    {
//        // Arrange
//        var command = new RegisterCommand("newuser@example.com", "Password123", "Player");
//        var userId = Guid.NewGuid();

//        _identityServiceMock.Setup(x => x.RegisterUserAsync(command.Email, command.Password, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(Result<Guid>.Success(userId));

//        var users = new List<User>(); // فارغ
//        var usersMockDbSet = users.BuildMock();
//        _contextMock.Setup(x => x.Users).Returns(usersMockDbSet.Object);

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeFalse();
//        result.Value.ShouldBe(userId);
//        _contextMock.Verify(x => x.Users.Add(It.IsAny<User>()), Times.Once);
//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
//    }

//    [Fact]
//    public async Task Handle_IdentityFailure_ReturnsErrors()
//    {
//        // Arrange
//        var command = new RegisterCommand("existing@example.com", "Password123", "Player");
//        var errors = new List<Error> { Error.Conflict("User.Exists", "User already exists") };

//        _identityServiceMock.Setup(x => x.RegisterUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(Result<Guid>.Failure(errors));

//        // Act
//        var result = await _handler.Handle(command, CancellationToken.None);

//        // Assert
//        result.IsError.ShouldBeTrue();
//        result.Errors.ShouldContain(e => e.Code == "User.Exists");
//        _contextMock.Verify(x => x.Users.Add(It.IsAny<User>()), Times.Never);
//        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
//    }

//    [Fact]
//    public async Task Handle_InvalidRole_ThrowsArgumentException()
//    {
//        // Arrange
//        var command = new RegisterCommand("user@example.com", "Password123", "InvalidRole");

//        // Act & Assert
//        await Should.ThrowAsync<ArgumentException>(async () =>
//        {
//            await _handler.Handle(command, CancellationToken.None);
//        });
//    }

//    // يمكن إضافة اختبار لفشل إنشاء المستخدم إذا كان User.Create يمكن أن يفشل.
//}