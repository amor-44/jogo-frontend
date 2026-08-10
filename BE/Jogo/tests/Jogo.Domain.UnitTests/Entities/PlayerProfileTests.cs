using FluentAssertions;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Xunit;

namespace Jogo.Domain.UnitTests.Entities;

public class PlayerProfileTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateProfileWithBasicInfo()
    {
        // Arrange & Act
        var result = PlayerProfile.Create(
            Guid.NewGuid(),
            "John Doe",
            new DateTime(2000, 1, 1),
            Position.Striker,
            PreferredFoot.Right,
            "USA");

        // Assert
        result.IsSuccess.Should().BeTrue();
        var profile = result.Value;
        
        profile.HasBasicInfo.Should().BeTrue();
        profile.IsComplete.Should().BeFalse(); // Requires videos
    }

    [Fact]
    public void HasBasicInfo_ShouldBeFalse_WhenCountryIsMissing()
    {
        // Note: the Create factory method enforces country. 
        // We'll test with reflection or just bypass it for the sake of checking the property logic if needed,
        // but since Create enforces it, we can't easily create an incomplete one through the factory.
        // Wait, IsComplete checks FullName, Country, DateOfBirth.
        // The Create method forces FullName and Country to not be null/whitespace.
        // So a profile created via factory is always complete, which is good!
        
        var profile = PlayerProfile.Create(
            Guid.NewGuid(),
            "John Doe",
            new DateTime(2000, 1, 1),
            Position.Striker,
            PreferredFoot.Right,
            "USA").Value;

        typeof(PlayerProfile).GetProperty("Country")!.SetValue(profile, "");

        profile.HasBasicInfo.Should().BeFalse();
    }

    [Fact]
    public void UpdateProfilePicture_WithValidUrl_ShouldSucceed()
    {
        var profile = PlayerProfile.Create(
            Guid.NewGuid(),
            "John Doe",
            new DateTime(2000, 1, 1),
            Position.Striker,
            PreferredFoot.Right,
            "USA").Value;

        var url = "https://example.com/image.jpg";
        var result = profile.UpdateProfilePicture(url);

        result.IsSuccess.Should().BeTrue();
        profile.ProfilePictureUrl.Should().Be(url);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void UpdateProfilePicture_WithInvalidUrl_ShouldFail(string url)
    {
        var profile = PlayerProfile.Create(
            Guid.NewGuid(),
            "John Doe",
            new DateTime(2000, 1, 1),
            Position.Striker,
            PreferredFoot.Right,
            "USA").Value;

        var result = profile.UpdateProfilePicture(url);

        result.IsError.Should().BeTrue();
        result.TopError.Code.Should().Be("PlayerProfile.InvalidUrl");
    }
}
