//using System.Net;
//using System.Net.Http.Json;

//using FluentAssertions;

//using Jogo.Application.Features.Authentication.Login;
//using Jogo.Application.Features.Player.CreateProfile;
//using Jogo.Application.Features.Player.GetProfile;
//using Jogo.Application.Features.Player.UpdateProfile;
//using Jogo.Domain.Enums;
//using Jogo.Infrastructure.Data;

//using Microsoft.Extensions.DependencyInjection;

//using Xunit;

//namespace Jogo.Api.IntegrationTests;

//public class PlayerEndpointsTests : IClassFixture<CustomWebApplicationFactory>
//{
//    private readonly HttpClient _client;
//    private readonly CustomWebApplicationFactory _factory;

//    public PlayerEndpointsTests(CustomWebApplicationFactory factory)
//    {
//        _factory = factory;
//        _client = factory.CreateClient();
//    }

//    private async Task<string> GetPlayerTokenAsync()
//    {
//        var uniqueEmail = $"player-{Guid.NewGuid()}@test.com";
//        var password = "Password123!";

//        await _client.PostAsJsonAsync("/api/v1/auth/register", new RegisterCommand(uniqueEmail, password, "Player"));
//        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginCommand(uniqueEmail, password));

//        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
//        return loginResult!.AccessToken;
//    }

//    [Fact]
//    public async Task EndToEnd_PlayerProfile_Flow()
//    {
//        // Setup Database
//        using (var scope = _factory.Services.CreateScope())
//        {
//            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//            await db.Database.EnsureCreatedAsync();
//        }

//        var token = await GetPlayerTokenAsync();
//        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

//        // 1. GetProfile (Not Found initially)
//        var getResponse1 = await _client.GetAsync("/api/v1/player/profile");
//        getResponse1.StatusCode.Should().Be(HttpStatusCode.NotFound);

//        // 2. CreateProfile
//        var createCommand = new CreateProfileCommand("John Doe", new DateTime(2000, 1, 1), Position.Striker, PreferredFoot.Right, "USA");
//        var createResponse = await _client.PostAsJsonAsync("/api/v1/player/profile", createCommand);
//        createResponse.StatusCode.Should().Be(HttpStatusCode.OK);

//        var profileId = await createResponse.Content.ReadFromJsonAsync<Guid>();
//        profileId.Should().NotBeEmpty();

//        // 3. GetProfile (Found)
//        var getResponse2 = await _client.GetAsync("/api/v1/player/profile");
//        getResponse2.StatusCode.Should().Be(HttpStatusCode.OK);
//        var profile = await getResponse2.Content.ReadFromJsonAsync<ProfileDto>();
//        profile.Should().NotBeNull();
//        profile!.FullName.Should().Be("John Doe");
//        profile.Country.Should().Be("USA");
//        profile.IsComplete.Should().BeTrue();

//        // 4. UpdateProfile
//        var updateCommand = new UpdateProfileCommand("NY", 180, 75, Position.LeftWinger, "NYFC", "Hi", ProfileVisibility.Public);
//        var updateResponse = await _client.PutAsJsonAsync("/api/v1/player/profile", updateCommand);
//        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

//        // 5. Verify Update
//        var getResponse3 = await _client.GetAsync("/api/v1/player/profile");
//        var updatedProfile = await getResponse3.Content.ReadFromJsonAsync<ProfileDto>();
//        updatedProfile!.City.Should().Be("NY");
//        updatedProfile.Visibility.Should().Be(ProfileVisibility.Public);
//    }
//}