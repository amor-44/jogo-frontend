using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using Jogo.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Jogo.Api.IntegrationTests;

[Collection(nameof(CustomWebApplicationFactory))]
public class ReportsEndpointsTests : IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _fixture;
    private readonly HttpClient _client;
    
    private Guid _playerUserId;
    private Guid _scoutUserId;
    private Guid _unauthorizedScoutUserId;

    private PlayerProfile _playerProfile;
    private ScoutProfile _authorizedScoutProfile;
    private ScoutProfile _unauthorizedScoutProfile;
    
    private FootballVideo _video;
    private AnalysisReport _report;

    public ReportsEndpointsTests(CustomWebApplicationFactory fixture)
    {
        _fixture = fixture;
        _client = fixture.CreateClient();
    }

    public async Task InitializeAsync()
    {
        _playerUserId = Guid.NewGuid();
        _scoutUserId = Guid.NewGuid();
        _unauthorizedScoutUserId = Guid.NewGuid();

        _playerProfile = PlayerProfile.Create(_playerUserId, "Test Player", DateTime.UtcNow.AddYears(-20), Position.Striker, PreferredFoot.Right, "Country").Value;
        _authorizedScoutProfile = ScoutProfile.Create(_scoutUserId, "Test Scout", "Agency", 5).Value;
        _unauthorizedScoutProfile = ScoutProfile.Create(_unauthorizedScoutUserId, "Unauthorized Scout", "Agency", 3).Value;

        using var scope = _fixture.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        
        context.Users.Add(User.Create(_playerUserId, Role.Player).Value);
        context.Users.Add(User.Create(_scoutUserId, Role.Scout).Value);
        context.Users.Add(User.Create(_unauthorizedScoutUserId, Role.Scout).Value);

        context.PlayerProfiles.Add(_playerProfile);
        context.ScoutProfiles.Add(_authorizedScoutProfile);
        context.ScoutProfiles.Add(_unauthorizedScoutProfile);
        
        await context.SaveChangesAsync(CancellationToken.None);

        _video = FootballVideo.Upload(_playerProfile.Id, "http://url", "test.mp4", TimeSpan.FromMinutes(1)).Value;
        context.FootballVideos.Add(_video);
        await context.SaveChangesAsync(CancellationToken.None);

        var metrics = PerformanceMetrics.Create(82, 87, 79, 84, 76, 78, 73, 71);
        _report = AnalysisReport.Create(_video.Id, 85, "Summary", ["Strength"], ["Weakness"], ["Rec"], "v1", metrics).Value;
        context.AnalysisReports.Add(_report);

        var contactRequest = ContactRequest.Create(_authorizedScoutProfile.Id, _playerProfile.Id).Value;
        contactRequest.Accept();
        context.ContactRequests.Add(contactRequest);

        await context.SaveChangesAsync(CancellationToken.None);
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private void AuthenticateUser(Guid userId, string role)
    {
        var token = _fixture.GenerateJwtToken(userId.ToString(), role);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task GetReport_WhenOwner_ReturnsOk()
    {
        // Arrange
        AuthenticateUser(_playerUserId, "Player");

        // Act
        var response = await _client.GetAsync($"/api/v1/reports/{_report.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain(_report.Id.ToString());
    }

    [Fact]
    public async Task GetReport_WhenAuthorizedScout_ReturnsOk()
    {
        // Arrange
        AuthenticateUser(_scoutUserId, "Scout");

        // Act
        var response = await _client.GetAsync($"/api/v1/reports/{_report.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain(_report.Id.ToString());
    }

    [Fact]
    public async Task GetReport_WhenUnauthorizedScout_ReturnsForbidden()
    {
        // Arrange
        AuthenticateUser(_unauthorizedScoutUserId, "Scout");

        // Act
        var response = await _client.GetAsync($"/api/v1/reports/{_report.Id}");

        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden, content);
    }

    [Fact]
    public async Task ListReports_WhenPlayer_ReturnsPaginatedList()
    {
        // Arrange
        AuthenticateUser(_playerUserId, "Player");

        // Act
        var response = await _client.GetAsync("/api/v1/reports?pageNumber=1&pageSize=10");

        var content = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, content);
        content.Should().Contain(_report.Id.ToString());
    }
}
