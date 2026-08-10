using FluentValidation;
using Jogo.Domain.Common.Constants;

namespace Jogo.Application.Features.Authentication.Commands.RegisterPlayer;

public class RegisterPlayerCommandValidator : AbstractValidator<RegisterPlayerCommand>
{
    public RegisterPlayerCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");
            
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

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
