using Jogo.Application.Features.Authentication.DTOs;
using FluentValidation;

namespace Jogo.Application.Features.Authentication.Commands.Refresh;

public class RefreshCommandValidator : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
        RuleFor(x => x.AccessToken).NotEmpty();

    }
}
