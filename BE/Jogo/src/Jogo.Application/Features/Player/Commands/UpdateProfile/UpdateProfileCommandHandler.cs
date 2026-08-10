using Jogo.Application.Features.Player.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Caching.Hybrid;

namespace Jogo.Application.Features.Player.Commands.UpdateProfile;

public class UpdateProfileCommandHandler(
    IAppDbContext context,
    IUser currentUser,
    HybridCache hybridCache) : IRequestHandler<UpdateProfileCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. التحقق من الهوية واستخراج الـ UserId
        if (string.IsNullOrEmpty(currentUser.Id) || !Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        // 2. جلب البروفايل الخاص بالمستخدم
        var profile = await context.PlayerProfiles
            .Include(p => p.FootballVideos)
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        // 3. تحديث التفاصيل عبر الـ Domain Method
        var updateResult = profile.UpdateDetails(
            request.City,
            request.Height,
            request.Weight,
            request.SecondaryPosition,
            request.CurrentClub,
            request.Biography,
            request.FootballExperience,
            request.MarketValue);

        if (updateResult.IsError)
        {
            return updateResult.Errors;
        }

        if (request.Visibility == Jogo.Domain.Enums.ProfileVisibility.Public && !profile.IsComplete)
        {
            return Error.Validation("PlayerProfile.Incomplete", "Profile cannot be made public until it is complete (requires at least one video).");
        }

        // 4. تغيير رؤية البروفايل (Visibility)
        var visibilityResult = profile.ChangeVisibility(request.Visibility);
        if (visibilityResult.IsError)
        {
            return visibilityResult.Errors;
        }

        // 5. حفظ التعديلات في قاعدة البيانات
        await context.SaveChangesAsync(cancellationToken);

        // 6. Invalidate player discovery cache
        await hybridCache.RemoveByTagAsync("players", cancellationToken);

        return Result.Success;
    }
}
