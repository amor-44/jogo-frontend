using FluentValidation;
using Jogo.Domain.Common.Constants;

namespace Jogo.Application.Features.Player.CreateProfile;

public class CreateProfileCommandValidator : AbstractValidator<CreateProfileCommand>
{
    public CreateProfileCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name must not exceed 200 characters.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required.")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters.");

        RuleFor(x => x.DateOfBirth)
            .LessThan(DateTime.UtcNow.Date).WithMessage("Date of birth must be in the past.");
            
        RuleFor(x => x.PrimaryPosition)
            .IsInEnum().WithMessage("Invalid primary position.");

        RuleFor(x => x.PreferredFoot)
            .IsInEnum().WithMessage("Invalid preferred foot.");
    }
}
