
using Jogo.Domain.Common;
using Jogo.Domain.Common.Results;

namespace Jogo.Domain.Entities;

public class ScoutProfile : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string Organization { get; private set; } = string.Empty;
    public string Country { get; private set; } = string.Empty;
    public int ExperienceYears { get; private set; }

    private ScoutProfile() { }

    private ScoutProfile(Guid id, Guid userId, string organization, string country, int experienceYears) : base(id)
    {
        UserId = userId;
        Organization = organization;
        Country = country;
        ExperienceYears = experienceYears;
    }

    public static Result<ScoutProfile> Create(Guid userId, string organization, string country, int experienceYears)
    {
        if (userId == Guid.Empty) return Error.Validation("ScoutProfile.InvalidUserId", "User ID is required.");
        if (string.IsNullOrWhiteSpace(organization)) return Error.Validation("ScoutProfile.InvalidOrganization", "Organization is required.");
        if (string.IsNullOrWhiteSpace(country)) return Error.Validation("ScoutProfile.InvalidCountry", "Country is required.");
        if (experienceYears < 0) return Error.Validation("ScoutProfile.InvalidExperience", "Experience years cannot be negative.");

        return new ScoutProfile(Guid.NewGuid(), userId, organization, country, experienceYears);
    }

    public Result<Success> UpdateDetails(string organization, string country, int experienceYears)
    {
        if (string.IsNullOrWhiteSpace(organization)) return Error.Validation("ScoutProfile.InvalidOrganization", "Organization is required.");
        if (string.IsNullOrWhiteSpace(country)) return Error.Validation("ScoutProfile.InvalidCountry", "Country is required.");
        if (experienceYears < 0) return Error.Validation("ScoutProfile.InvalidExperience", "Experience years cannot be negative.");

        Organization = organization;
        Country = country;
        ExperienceYears = experienceYears;

        return Result.Success;
    }
}
