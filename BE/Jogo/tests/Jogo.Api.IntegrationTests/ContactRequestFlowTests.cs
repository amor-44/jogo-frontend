using System.Net;
using System.Net.Http.Json;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Discovery.Commands.CreateContactRequest;
using Jogo.Application.Features.Player.Commands.RespondToContactRequest;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Jogo.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Jogo.Api.IntegrationTests;

public class ContactRequestFlowTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ContactRequestFlowTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ScoutPlayer_ContactFlow_AllowsGetReport()
    {
        // 1. Arrange: Setup Scout, Player, and an Analysis Report for the Player
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var scoutUser = User.Create(Guid.NewGuid(), Role.Scout).Value;
        var playerUser = User.Create(Guid.NewGuid(), Role.Player).Value;
        
        context.Users.AddRange(scoutUser, playerUser);
        await context.SaveChangesAsync();

        var scoutProfile = ScoutProfile.Create(scoutUser.Id, "Test Agency", "USA", 5).Value;
        var playerProfile = PlayerProfile.Create(playerUser.Id, "Test Player", DateTime.UtcNow.AddYears(-20), Position.Striker, PreferredFoot.Right, "UK").Value;
        
        context.ScoutProfiles.Add(scoutProfile);
        context.PlayerProfiles.Add(playerProfile);
        await context.SaveChangesAsync();

        // Add a video and report for the player
        var video = FootballVideo.Upload(playerProfile.Id, "url", "file.mp4", TimeSpan.FromMinutes(5)).Value;
        context.FootballVideos.Add(video);
        await context.SaveChangesAsync();

        var report = AnalysisReport.Create(video.Id, 80, "Scout Notes", 
            new List<string>(), new List<string>(), new List<string>(), "v1.0",
            Jogo.Domain.ValueObjects.PerformanceMetrics.Create(80, 80, 80, 80, 80, 80, 80, 80)).Value;
        context.AnalysisReports.Add(report);
        await context.SaveChangesAsync();

        var scoutToken = _factory.GenerateJwtToken(scoutUser.Id.ToString(), nameof(Role.Scout));
        var playerToken = _factory.GenerateJwtToken(playerUser.Id.ToString(), nameof(Role.Player));

        // 2. Act: Scout tries to get report (Should be Forbidden because no accepted contact request)
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", scoutToken);
        var initialGetReportResponse = await _client.GetAsync($"/api/v1/reports/{report.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, initialGetReportResponse.StatusCode);

        // 3. Act: Scout sends a Contact Request
        var createRequestCmd = new CreateContactRequestCommand(playerProfile.Id, "Hello, I'd like to scout you");
        var createRequestResponse = await _client.PostAsJsonAsync("/api/v1/contact-requests", createRequestCmd);
        createRequestResponse.EnsureSuccessStatusCode();
        var contactRequestId = await createRequestResponse.Content.ReadFromJsonAsync<Guid>();

        // 4. Act: Scout sends duplicate Contact Request (Should be Conflict)
        var duplicateRequestResponse = await _client.PostAsJsonAsync("/api/v1/contact-requests", createRequestCmd);
        Assert.Equal(HttpStatusCode.Conflict, duplicateRequestResponse.StatusCode);

        // 5. Act: Player Accepts the Contact Request
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", playerToken);
        var respondCmd = new { Accept = true };
        var respondResponse = await _client.PostAsJsonAsync($"/api/v1/contact-requests/{contactRequestId}/respond", respondCmd);
        respondResponse.EnsureSuccessStatusCode();

        // 6. Act: Scout tries to get report again (Should now be OK)
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", scoutToken);
        var finalGetReportResponse = await _client.GetAsync($"/api/v1/reports/{report.Id}");
        finalGetReportResponse.EnsureSuccessStatusCode();
    }
}
