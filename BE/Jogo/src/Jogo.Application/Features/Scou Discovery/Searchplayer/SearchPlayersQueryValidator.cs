using FluentValidation;

namespace Jogo.Application.Features.Scout.SearchPlayers;

public class SearchPlayersQueryValidator : AbstractValidator<SearchPlayersQuery>
{
    public SearchPlayersQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.MinOverallScore)
            .InclusiveBetween(0, 100)
            .When(x => x.MinOverallScore.HasValue);
    }
}