using Jogo.Application.Features.Discovery.DTOs;
using System.Net;
using System.Net.Http.Json;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Discovery;
using Jogo.Application.Features.Player.Commands.UpdateProfile;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Jogo.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Jogo.Api.IntegrationTests;

public class PlayersDiscoveryEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public PlayersDiscoveryEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SearchPlayers_ExcludesHiddenProfiles()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Create user
        var publicUser = User.Create(Guid.NewGuid(), Role.Player);
        var hiddenUser = User.Create(Guid.NewGuid(), Role.Player);
        
        context.Users.AddRange(publicUser.Value, hiddenUser.Value);
        await context.SaveChangesAsync();

        var publicProfile = PlayerProfile.Create(publicUser.Value.Id, "Public Player", DateTime.UtcNow.AddYears(-20), Position.CentralMidfielder, PreferredFoot.Right, "Egypt").Value;
        publicProfile.ChangeVisibility(ProfileVisibility.Public);
        
        var hiddenProfile = PlayerProfile.Create(hiddenUser.Value.Id, "Hidden Player", DateTime.UtcNow.AddYears(-20), Position.CentralMidfielder, PreferredFoot.Right, "Egypt").Value;
        hiddenProfile.ChangeVisibility(ProfileVisibility.Hidden);

        context.PlayerProfiles.AddRange(publicProfile, hiddenProfile);
        await context.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync("/api/v1/players");
        var result = await response.Content.ReadFromJsonAsync<PaginatedList<PlayerCardDto>>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.NotNull(result);
        Assert.Contains(result.Items!, p => p.Id == publicProfile.Id);
        Assert.DoesNotContain(result.Items!, p => p.Id == hiddenProfile.Id);
    }
    
    [Fact]
    public async Task GetPlayer_WhenPublic_ReturnsProfile()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var publicUser = User.Create(Guid.NewGuid(), Role.Player);
        context.Users.Add(publicUser.Value);
        await context.SaveChangesAsync();

        var publicProfile = PlayerProfile.Create(publicUser.Value.Id, "Public Get Player", DateTime.UtcNow.AddYears(-20), Position.CentralMidfielder, PreferredFoot.Right, "Egypt").Value;
        publicProfile.ChangeVisibility(ProfileVisibility.Public);
        
        context.PlayerProfiles.Add(publicProfile);
        await context.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync($"/api/v1/players/{publicProfile.Id}");
        var result = await response.Content.ReadFromJsonAsync<PlayerCardDto>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.NotNull(result);
        Assert.Equal(publicProfile.Id, result.Id);
        Assert.Equal("Public Get Player", result.FullName);
    }
    
    [Fact]
    public async Task GetPlayer_WhenHidden_ReturnsForbidden()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var hiddenUser = User.Create(Guid.NewGuid(), Role.Player);
        context.Users.Add(hiddenUser.Value);
        await context.SaveChangesAsync();

        var hiddenProfile = PlayerProfile.Create(hiddenUser.Value.Id, "Hidden Get Player", DateTime.UtcNow.AddYears(-20), Position.CentralMidfielder, PreferredFoot.Right, "Egypt").Value;
        hiddenProfile.ChangeVisibility(ProfileVisibility.Hidden);
        
        context.PlayerProfiles.Add(hiddenProfile);
        await context.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync($"/api/v1/players/{hiddenProfile.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
    
}
