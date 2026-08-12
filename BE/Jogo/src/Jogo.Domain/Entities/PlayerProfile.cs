using Jogo.Domain.Common;
using Jogo.Domain.Common.Constants;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

namespace Jogo.Domain.Entities;

public class PlayerProfile : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public string Country { get; private set; } = string.Empty;
    public string? City { get; private set; }
    public decimal? Height { get; private set; }
    public decimal? Weight { get; private set; }
    public PreferredFoot PreferredFoot { get; private set; }
    public Position PrimaryPosition { get; private set; }
    public Position? SecondaryPosition { get; private set; }
    public string? CurrentClub { get; private set; }
    public string? Biography { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public ProfileVisibility Visibility { get; private set; }
    public string? FootballExperience { get; private set; }
    public decimal? MarketValue { get; private set; }

    public bool HasBasicInfo => !string.IsNullOrWhiteSpace(FullName) && 
                                !string.IsNullOrWhiteSpace(Country) && 
                                DateOfBirth != default;

    public bool IsComplete => HasBasicInfo && FootballVideos.Any();
    public User User { get; private set; } = null!;

    public ICollection<FootballVideo> FootballVideos { get; private set; }
        = new List<FootballVideo>();

    public ICollection<ContactRequest> ContactRequests { get; private set; }
        = new List<ContactRequest>();

    public int Age
    {
        get
        {
            var today = DateTime.Today;
            var age = today.Year - DateOfBirth.Year;
            if (DateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }
    }

    private PlayerProfile() { }

    private PlayerProfile(
        Guid id,
        Guid userId,
        string fullName,
        DateTime dateOfBirth,
        Position primaryPosition,
        PreferredFoot preferredFoot,
        string country) : base(id)
    {
        UserId = userId;
        FullName = fullName;
        DateOfBirth = dateOfBirth;
        PrimaryPosition = primaryPosition;
        PreferredFoot = preferredFoot;
        Country = country;
        Visibility = ProfileVisibility.Public;
    }

    public static Result<PlayerProfile> Create(
        Guid userId,
        string fullName,
        DateTime dateOfBirth,
        Position primaryPosition,
        PreferredFoot preferredFoot,
        string country)
    {
        if (userId == Guid.Empty) return Error.Validation("PlayerProfile.InvalidUserId", "User ID is required.");
        if (string.IsNullOrWhiteSpace(fullName)) return Error.Validation("PlayerProfile.InvalidFullName", "Full name is required.");
        if (string.IsNullOrWhiteSpace(country)) return Error.Validation("PlayerProfile.InvalidCountry", "Country is required.");

        if (dateOfBirth >= DateTime.UtcNow.Date)
            return Error.Validation("PlayerProfile.InvalidDateOfBirth", "Date of birth must be in the past.");

        var age = DateTime.Today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;

        if (age < JogoConstants.MinPlausiblePlayingAge || age > JogoConstants.MaxPlausiblePlayingAge)
        {
            return Error.Validation("PlayerProfile.ImplausibleAge", $"Age must be between {JogoConstants.MinPlausiblePlayingAge} and {JogoConstants.MaxPlausiblePlayingAge}.");
        }

        return new PlayerProfile(Guid.NewGuid(), userId, fullName, dateOfBirth, primaryPosition, preferredFoot, country);
    }

    public Result<Success> UpdateDetails(
        string? city,
        decimal? height,
        decimal? weight,
        Position? secondaryPosition,
        string? currentClub,
        string? biography,
        string? footballExperience,
        decimal? marketValue)
    {
        if (height.HasValue && height.Value <= 0)
            return Error.Validation("PlayerProfile.InvalidHeight", "Height must be positive.");

        if (weight.HasValue && weight.Value <= 0)
            return Error.Validation("PlayerProfile.InvalidWeight", "Weight must be positive.");

        if (!string.IsNullOrWhiteSpace(biography) && biography.Length > JogoConstants.MaxBiographyLength)
            return Error.Validation("PlayerProfile.BiographyTooLong", $"Biography cannot exceed {JogoConstants.MaxBiographyLength} characters.");

        City = city;
        Height = height;
        Weight = weight;
        SecondaryPosition = secondaryPosition;
        CurrentClub = currentClub;
        Biography = biography;
        FootballExperience = footballExperience;
        MarketValue = marketValue;

        return Result.Success;
    }

    public Result<Success> ChangeVisibility(ProfileVisibility visibility)
    {
        Visibility = visibility;
        return Result.Success;
    }

    public Result<Success> UpdateProfilePicture(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return Error.Validation("PlayerProfile.InvalidUrl", "Profile picture URL is required.");
        ProfilePictureUrl = url;
        return Result.Success;
    }
}
