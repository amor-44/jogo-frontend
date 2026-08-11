using System.Text;

using Hangfire;

using Jogo.Application.Common.Interfaces;
using Jogo.Infrastructure.BackgroundJobs;
using Jogo.Infrastructure.Data;
using Jogo.Infrastructure.Data.Interceptors;
using Jogo.Infrastructure.Identity;
using Jogo.Infrastructure.Services;
using Jogo.Infrastructure.Services.Ai; // ✅ السطر المطلوب لمنع CS0246
using Jogo.Infrastructure.Settings;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddSingleton(TimeProvider.System);

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        ArgumentNullException.ThrowIfNull(connectionString);

        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();

        services.AddDbContext<AppDbContext>(
            (sp, options) =>
            {
                options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
                options.UseSqlServer(connectionString);
            }
        );

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddScoped<ApplicationDbContextInitialiser>();

        services.Configure<Jwt>(configuration.GetSection("Jwt"));

        var jwtSettings = configuration.GetSection("Jwt").Get<Jwt>()
                 ?? throw new InvalidOperationException("JWT settings are missing in appsettings.json!");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    if (!string.IsNullOrEmpty(accessToken))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };

            options.SaveToken = true;
            options.RequireHttpsMetadata = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
            };
        });

        services
            .AddIdentityCore<IdentityUser>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequiredUniqueChars = 1;
                options.SignIn.RequireConfirmedAccount = false;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.AddTransient<IIdentityService, IdentityService>();

        services.AddDistributedMemoryCache();
        services.AddHybridCache(options =>
            options.DefaultEntryOptions = new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(10),
                LocalCacheExpiration = TimeSpan.FromSeconds(30),
            }
        );

        // 🟢 خيار 1: تشغيل الـ HttpClient الحقيقي
        services.AddHttpClient<IAiAnalysisService, AiAnalysisService>(client =>
        {
            var baseUrl = configuration["AiService:BaseUrl"]
                          ?? throw new InvalidOperationException("AI Service BaseUrl is not configured.");

            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromMinutes(30);
        });

        // 🟡 خيار 2: لو عايز تجرّب الـ Fake بدلاً من הـ HttpClient، فك التهميش عن السطر اللي تحت واعمل Comment للـ AddHttpClient فوق
        // services.AddScoped<IAiAnalysisService, FakeAiAnalysisService>();

        services.AddScoped<ITokenProvider, TokenProvider>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();

        services.AddScoped<INotificationService, NotificationService>();

        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IVideoStorageService, LocalVideoStorageService>();

        services.AddScoped<IBackgroundJobService, BackgroundJobService>();

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString));

        services.AddHangfireServer();

        return services;
    }
}