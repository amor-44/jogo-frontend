using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Data;

using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContextInitialiser(
    ILogger<ApplicationDbContextInitialiser> logger,
    AppDbContext context,
    UserManager<IdentityUser> userManager,
    RoleManager<IdentityRole> roleManager
)
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger = logger;
    private readonly AppDbContext _context = context;
    private readonly UserManager<IdentityUser> _userManager = userManager;
    private readonly RoleManager<IdentityRole> _roleManager = roleManager;

    public async Task InitialiseAsync()
    {
        try
        {
            if (_context.Database.IsRelational())
            {
                await _context.Database.MigrateAsync();
            }
            else
            {
                await _context.Database.EnsureCreatedAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default roles
        var roles = new[] { Role.Player.ToString(), Role.Scout.ToString(), Role.Admin.ToString() };
        foreach (var role in roles)
        {
            if (_roleManager.Roles.All(r => r.Name != role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Default Admin User
        var adminEmail = "admin@jogo.com";
        if (_userManager.Users.All(u => u.Email != adminEmail))
        {
            var adminUser = new IdentityUser { UserName = adminEmail, Email = adminEmail };
            var result = await _userManager.CreateAsync(adminUser, "P@ssword1234");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, Role.Admin.ToString());
                var user = User.Create(Guid.Parse(adminUser.Id), Role.Admin).Value;
                _context.Users.Add(user);
            }
        }

        // Default Player
        var playerEmail = "player@jogo.com";
        if (_userManager.Users.All(u => u.Email != playerEmail))
        {
            var playerUser = new IdentityUser { UserName = playerEmail, Email = playerEmail };
            var result = await _userManager.CreateAsync(playerUser, "P@ssword1234");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(playerUser, Role.Player.ToString());
                var user = User.Create(Guid.Parse(playerUser.Id), Role.Player).Value;
                _context.Users.Add(user);

                var profile = PlayerProfile
                    .Create(
                        user.Id,
                        "Default Player",
                        new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                        Position.Striker,
                        PreferredFoot.Right,
                        "Brazil"
                    )
                    .Value;
                profile.ChangeVisibility(ProfileVisibility.Public);
                _context.PlayerProfiles.Add(profile);
            }
        }

        // Default Scout
        var scoutEmail = "scout@jogo.com";
        if (_userManager.Users.All(u => u.Email != scoutEmail))
        {
            var scoutUser = new IdentityUser { UserName = scoutEmail, Email = scoutEmail };
            var result = await _userManager.CreateAsync(scoutUser, "P@ssword1234");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(scoutUser, Role.Scout.ToString());
                var user = User.Create(Guid.Parse(scoutUser.Id), Role.Scout).Value;
                _context.Users.Add(user);

                var profile = ScoutProfile.Create(user.Id, "Scout Org", "Brazil", 10).Value;
                _context.ScoutProfiles.Add(profile);
            }
        }

        await _context.SaveChangesAsync();
    }
}

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser =
            scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();

        await initialiser.SeedAsync();
    }
}
