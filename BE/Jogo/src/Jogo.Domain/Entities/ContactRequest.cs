using Jogo.Domain.Common;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

namespace Jogo.Domain.Entities;

public class ContactRequest : AuditableEntity
{
    public Guid ScoutProfileId { get; private set; }
    public Guid PlayerProfileId { get; private set; }
    public ContactRequestStatus Status { get; private set; }
    public DateTimeOffset RequestedAt { get; private set; }
    public DateTimeOffset? RespondedAt { get; private set; }
    public string? Message { get; private set; }
    public PlayerProfile PlayerProfile { get; private set; } = null!;

    public ScoutProfile ScoutProfile { get; private set; } = null!;
    private ContactRequest() { }

    private ContactRequest(Guid id, Guid scoutProfileId, Guid playerProfileId, string? message) : base(id)
    {
        ScoutProfileId = scoutProfileId;
        PlayerProfileId = playerProfileId;
        Message = message;
        Status = ContactRequestStatus.Pending;
        RequestedAt = DateTimeOffset.UtcNow;
    }

    public static Result<ContactRequest> Create(Guid scoutProfileId, Guid playerProfileId, string? message = null)
    {
        if (scoutProfileId == Guid.Empty) return Error.Validation("ContactRequest.InvalidScout", "Scout profile ID is required.");
        if (playerProfileId == Guid.Empty) return Error.Validation("ContactRequest.InvalidPlayer", "Player profile ID is required.");

        if (message != null && message.Length > 500) return Error.Validation("ContactRequest.MessageTooLong", "Message cannot exceed 500 characters.");

        return new ContactRequest(Guid.NewGuid(), scoutProfileId, playerProfileId, message);
    }

    public Result<Success> Accept()
    {
        if (Status != ContactRequestStatus.Pending)
            return Error.Conflict("ContactRequest.InvalidTransition", "Can only accept a pending request.");

        Status = ContactRequestStatus.Accepted;
        RespondedAt = DateTimeOffset.UtcNow;
        return Result.Success;
    }

    public Result<Success> Reject()
    {
        if (Status != ContactRequestStatus.Pending)
            return Error.Conflict("ContactRequest.InvalidTransition", "Can only reject a pending request.");

        Status = ContactRequestStatus.Rejected;
        RespondedAt = DateTimeOffset.UtcNow;
        return Result.Success;
    }
}
