using Jogo.Application.Features.Player.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.Queries.GetProfile;

public class GetProfileQueryHandler(
    IAppDbContext context,
    IUser currentUser) : IRequestHandler<GetProfileQuery, Result<PlayerProfileDto>>
{
    public async Task<Result<PlayerProfileDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        // 1. التحقق من الهوية واستخراج الـ UserId من الـ JWT Bearer Token
        if (string.IsNullOrEmpty(currentUser.Id) || !Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        // 2. جلب البروفايل باستخدام AsNoTracking لأداء أفضل مع القراءة فقط
        var profile = await context.PlayerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        // 3. التجميع في PlayerProfileDto وإرجاع الناتج
        var dto = new PlayerProfileDto(
            profile.Id,
            profile.FullName,
            profile.DateOfBirth,
            profile.Age,
            profile.Country,
            profile.City,
            profile.Height,
            profile.Weight,
            profile.PreferredFoot,
            profile.PrimaryPosition,
            profile.SecondaryPosition,
            profile.CurrentClub,
            profile.Biography,
            profile.ProfilePictureUrl,
            profile.Visibility,
            profile.IsComplete);

        return dto;
    }
}
