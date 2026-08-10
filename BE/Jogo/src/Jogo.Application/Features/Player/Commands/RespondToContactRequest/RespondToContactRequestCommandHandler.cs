using Jogo.Application.Features.Player.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.Commands.RespondToContactRequest;

public class RespondToContactRequestCommandHandler(
    IAppDbContext context,
    IUser currentUser) : IRequestHandler<RespondToContactRequestCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(RespondToContactRequestCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id) || !Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var playerProfile = await context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (playerProfile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        var contactRequest = await context.ContactRequests
            .FirstOrDefaultAsync(cr => cr.Id == request.ContactRequestId, cancellationToken);

        if (contactRequest == null)
        {
            return Error.NotFound("ContactRequest.NotFound", "Contact request not found.");
        }

        if (contactRequest.PlayerProfileId != playerProfile.Id)
        {
            return Error.Forbidden("ContactRequest.Forbidden", "You are not authorized to respond to this contact request.");
        }

        var result = request.Accept ? contactRequest.Accept() : contactRequest.Reject();

        if (result.IsError)
        {
            return result.Errors;
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
