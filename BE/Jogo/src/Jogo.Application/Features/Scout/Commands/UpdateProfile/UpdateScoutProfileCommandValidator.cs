using Jogo.Application.Features.Scout.DTOs;
using FluentValidation;

namespace Jogo.Application.Features.Scout.Commands.UpdateProfile;

public class UpdateScoutProfileCommandValidator : AbstractValidator<UpdateScoutProfileCommand>
{
    public UpdateScoutProfileCommandValidator()
    {
        RuleFor(x => x.Organization)
            .NotEmpty().WithMessage("Organization is required.")
            .MaximumLength(200).WithMessage("Organization must not exceed 200 characters.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required.")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters.");

        RuleFor(x => x.ExperienceYears)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Experience years cannot be negative.");
    }
}
