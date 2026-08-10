using Jogo.Application.Common.Models;
using Jogo.Application.Features.Player.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;
using System;

namespace Jogo.Application.Features.Player.Queries.ListContactRequests;

public record ListContactRequestsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<PlayerContactRequestDto>>>;
