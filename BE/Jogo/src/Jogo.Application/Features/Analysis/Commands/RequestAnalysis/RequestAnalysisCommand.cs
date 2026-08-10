using Jogo.Application.Features.Analysis.DTOs;
using System.Text.Json.Serialization;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Analysis.Commands.RequestAnalysis;

public record RequestAnalysisCommand : IRequest<Result<Success>>
{
    [JsonIgnore]
    public Guid VideoId { get; init; }
}
