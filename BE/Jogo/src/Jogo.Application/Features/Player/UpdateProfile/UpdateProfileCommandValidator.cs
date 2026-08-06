using FluentValidation;
using Jogo.Domain.Common.Constants;

namespace Jogo.Application.Features.Player.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(x => x.Height)
            .GreaterThan(0).When(x => x.Height.HasValue).WithMessage("Height must be positive.");

        RuleFor(x => x.Weight)
            .GreaterThan(0).When(x => x.Weight.HasValue).WithMessage("Weight must be positive.");

        RuleFor(x => x.SecondaryPosition)
            .IsInEnum().When(x => x.SecondaryPosition.HasValue).WithMessage("Invalid secondary position.");

        RuleFor(x => x.CurrentClub)
            .MaximumLength(200).WithMessage("Current club must not exceed 200 characters.");

        RuleFor(x => x.Biography)
            .MaximumLength(JogoConstants.MaxBiographyLength).WithMessage($"Biography cannot exceed {JogoConstants.MaxBiographyLength} characters.");

        RuleFor(x => x.Visibility)
            .IsInEnum().WithMessage("Invalid visibility.");
    }
}
