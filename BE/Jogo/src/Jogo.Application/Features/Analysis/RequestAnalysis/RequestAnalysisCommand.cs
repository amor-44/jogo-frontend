using System.Text.Json.Serialization;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Analysis.RequestAnalysis;

public record RequestAnalysisCommand : IRequest<Result<Success>>
{
    [JsonIgnore]
    public Guid VideoId { get; init; }
}
