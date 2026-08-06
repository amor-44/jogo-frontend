using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.CreateProfile;

public class CreateProfileCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context) : IRequestHandler<CreateProfileCommand, Result<CreateScoutProfileResponse>>
{
    public async Task<Result<CreateScoutProfileResponse>> Handle(
        CreateProfileCommand request,
        CancellationToken cancellationToken)
    {
        // 1. إنشاء الحساب في Identity بـ Role الخبير/الكشاف (Scout)
        var identityResult = await identityService.RegisterUserAsync(request.Email, request.Password, cancellationToken);
        if (identityResult.IsError)
        {
            return identityResult.Errors;
        }

        var userId = identityResult.Value;

        // 2. إنشاء كائن User الـ Domain بـ Role Scout
        var userResult = User.Create(userId, Role.Scout);
        if (userResult.IsError)
        {
            return userResult.Errors;
        }

        // 3. التحقق من عدم وجود بروفايل سابق
        var profileExists = await context.ScoutProfiles
            .AnyAsync(x => x.UserId == userId, cancellationToken);

        if (profileExists)
        {
            return Error.Conflict("ScoutProfile.AlreadyExists", "A profile already exists for this user.");
        }

        // 4. إنشاء كائن بروفايل الـ Scout
        var profileResult = ScoutProfile.Create(
            userId,
            request.Organization,
            request.Country,
            request.ExperienceYears);

        if (profileResult.IsError)
        {
            return profileResult.Errors;
        }

        // 5. الحفظ في قاعدة البيانات
        context.Users.Add(userResult.Value);
        context.ScoutProfiles.Add(profileResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        // 6. توليد التوكينات وحفظ الـ Refresh Token في Redis
        var (accessToken, refreshToken) = tokenProvider.GenerateTokens(userResult.Value);
        await refreshTokenService.SaveRefreshTokenAsync(userId, refreshToken, cancellationToken);

        // 7. إرجاع الـ Response كاملاً بكل بيانات البروفايل والتوكينات
        return new CreateScoutProfileResponse(
            profileResult.Value.Id,
            accessToken,
            refreshToken,
            userResult.Value.Role.ToString(),
            userId,
            profileResult.Value.Organization,
            profileResult.Value.Country,
            profileResult.Value.ExperienceYears);
    }
}