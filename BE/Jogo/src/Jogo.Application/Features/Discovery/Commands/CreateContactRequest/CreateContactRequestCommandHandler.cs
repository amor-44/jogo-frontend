using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Discovery.Commands.CreateContactRequest;

public class CreateContactRequestCommandHandler(
    IAppDbContext context,
    IUser currentUser,
    INotificationService notificationService) : IRequestHandler<CreateContactRequestCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContactRequestCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id) || !Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("ScoutProfile.Unauthorized", "User is not authorized.");
        }

        var scoutProfile = await context.ScoutProfiles
            .FirstOrDefaultAsync(s => s.UserId == currentUserId, cancellationToken);

        if (scoutProfile == null)
        {
            return Error.NotFound("ScoutProfile.NotFound", "Scout profile not found.");
        }

        var playerExists = await context.PlayerProfiles
            .AnyAsync(p => p.Id == request.PlayerProfileId, cancellationToken);

        if (!playerExists)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Target player profile not found.");
        }

        var existingPendingRequest = await context.ContactRequests
            .AnyAsync(cr => cr.ScoutProfileId == scoutProfile.Id 
                         && cr.PlayerProfileId == request.PlayerProfileId 
                         && cr.Status == ContactRequestStatus.Pending, cancellationToken);

        if (existingPendingRequest)
        {
            return Error.Conflict("ContactRequest.Duplicate", "A pending contact request already exists for this player.");
        }

        var contactRequestResult = ContactRequest.Create(scoutProfile.Id, request.PlayerProfileId, request.Message);
        
        if (contactRequestResult.IsError)
        {
            return contactRequestResult.Errors;
        }

        context.ContactRequests.Add(contactRequestResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        // Notify the player (in a real app, we would get the player's User.Email)
        var player = await context.PlayerProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == request.PlayerProfileId, cancellationToken);
            
        if (player?.User?.Email != null)
        {
            await notificationService.SendEmailAsync(player.User.Email, cancellationToken);
        }

        return contactRequestResult.Value.Id;
    }
}
