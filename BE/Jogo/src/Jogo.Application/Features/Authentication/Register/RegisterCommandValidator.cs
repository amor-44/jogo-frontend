using FluentValidation;
using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Authentication.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);

        RuleFor(x => x.Role)
            .NotEmpty()
            .IsEnumName(typeof(Role), caseSensitive: false)
            .WithMessage("Role must be a valid system role (e.g., Player, Scout).");
    }
}
