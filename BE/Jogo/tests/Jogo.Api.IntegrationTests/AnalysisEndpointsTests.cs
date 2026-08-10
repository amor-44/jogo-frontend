using System.Net;

using FluentAssertions;

using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Xunit;

namespace Jogo.Api.IntegrationTests;

[Collection(nameof(CustomWebApplicationFactory))]
public class AnalysisEndpointsTests : IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _fixture;
    private readonly HttpClient _client;
    private Guid _userId;
    private PlayerProfile _profile;

    public AnalysisEndpointsTests(CustomWebApplicationFactory fixture)
    {
        _fixture = fixture;
        _client = fixture.CreateClient();
    }

    public async Task InitializeAsync()
    {
        _userId = Guid.NewGuid();
        var token = _fixture.GenerateJwtToken(_userId.ToString(), "Player");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        _profile = PlayerProfile.Create(_userId, "Test", DateTime.UtcNow.AddYears(-20), Position.Striker, PreferredFoot.Right, "Country").Value;

        using var scope = _fixture.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        context.Users.Add(User.Create(_userId, Role.Player).Value);
        context.PlayerProfiles.Add(_profile);
        await context.SaveChangesAsync(CancellationToken.None);
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task RequestAnalysis_WhenValid_ReturnsAcceptedAndQueuesVideo()
    {
        // Arrange
        using var scope = _fixture.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        var video = FootballVideo.Upload(_profile.Id, "http://url", "test.mp4", TimeSpan.FromMinutes(1)).Value;
        context.FootballVideos.Add(video);
        await context.SaveChangesAsync(CancellationToken.None);

        // Act
        var response = await _client.PostAsync($"/api/v1/videos/{video.Id}/analysis", null);

        // Assert
        var responseBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Accepted, responseBody);

        var updatedVideo = await context.FootballVideos.AsNoTracking().FirstOrDefaultAsync(v => v.Id == video.Id);
        updatedVideo.Should().NotBeNull();
        updatedVideo!.Status.Should().Be(VideoAnalysisStatus.Queued);
    }

    [Fact]
    public async Task RetryAnalysis_WhenFailed_ReturnsAcceptedAndQueuesVideo()
    {
        // Arrange
        using var scope = _fixture.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
        var video = FootballVideo.Upload(_profile.Id, "http://url", "retry.mp4", TimeSpan.FromMinutes(1)).Value;
        video.MarkQueued();
        video.MarkProcessing();
        video.MarkFailed();
        context.FootballVideos.Add(video);
        await context.SaveChangesAsync(CancellationToken.None);

        // Act
        var response = await _client.PostAsync($"/api/v1/videos/{video.Id}/analysis/retry", null);

        // Assert
        var responseBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Accepted, responseBody);

        var updatedVideo = await context.FootballVideos.AsNoTracking().FirstOrDefaultAsync(v => v.Id == video.Id);
        updatedVideo.Should().NotBeNull();
        updatedVideo!.Status.Should().Be(VideoAnalysisStatus.Queued);
    }
}