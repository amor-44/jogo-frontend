using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;

using MediatR;

namespace Jogo.Application.Features.Player.CreateProfile;

public class CreateProfileCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context) : IRequestHandler<CreateProfileCommand, Result<CreateProfileResponse>>
{
    public async Task<Result<CreateProfileResponse>> Handle(CreateProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. تحويل نوع الـ Role
        var role = Enum.Parse<Role>(request.Role, ignoreCase: true);

        // 2. إنشاء الحساب في Identity
        var identityResult = await identityService.RegisterUserAsync(request.Email, request.Password, cancellationToken);
        if (identityResult.IsError)
        {
            return identityResult.Errors;
        }

        var userId = identityResult.Value;

        // 3. إنشاء كائن User الـ Domain
        var userResult = User.Create(userId, role);
        if (userResult.IsError)
        {
            return userResult.Errors;
        }

        // 4. إنشاء كائن البروفايل
        var profileResult = PlayerProfile.Create(
            userId,
            request.FullName,
            request.DateOfBirth,
            request.PrimaryPosition,
            request.PreferredFoot,
            request.Country);

        if (profileResult.IsError)
        {
            return profileResult.Errors;
        }

        // 5. الحفظ في قاعدة البيانات
        context.Users.Add(userResult.Value);
        context.PlayerProfiles.Add(profileResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        // 6. توليد التوكينات وحفظ الـ Refresh Token في Redis
        var (accessToken, refreshToken) = tokenProvider.GenerateTokens(userResult.Value);
        await refreshTokenService.SaveRefreshTokenAsync(userId, refreshToken, cancellationToken);

        // 7. إرجاع الـ Response كامل بالتوكينات ومعرف البروفايل
        return new CreateProfileResponse(
            profileResult.Value.Id,
            accessToken,
            refreshToken,
            userResult.Value.Role.ToString(),
            userId);
    }
}