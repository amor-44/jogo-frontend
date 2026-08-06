using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.UpdateProfile;

public class UpdateProfileCommandHandler(
    IAppDbContext context,
    IUser currentUser) : IRequestHandler<UpdateProfileCommand, Result<Success>>
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
            request.Biography);

        if (updateResult.IsError)
        {
            return updateResult.Errors;
        }

        // 4. تغيير رؤية البروفايل (Visibility)
        var visibilityResult = profile.ChangeVisibility(request.Visibility);
        if (visibilityResult.IsError)
        {
            return visibilityResult.Errors;
        }

        // 5. حفظ التعديلات في قاعدة البيانات
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}