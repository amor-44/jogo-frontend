//using System.Net;
//using System.Net.Http.Headers;
//using System.Net.Http.Json;

//using FluentAssertions;

//using Jogo.Application.Features.Videos.Queries;
//using Jogo.Infrastructure.Data;

//using Microsoft.Extensions.DependencyInjection;

//using Xunit;

//namespace Jogo.Api.IntegrationTests;

//public class VideoEndpointsTests : IClassFixture<CustomWebApplicationFactory>
//{
//    private readonly CustomWebApplicationFactory _factory;
//    private readonly HttpClient _client;

//    public VideoEndpointsTests(CustomWebApplicationFactory factory)
//    {
//        _factory = factory;
//        _client = factory.CreateClient();
//    }

//    private async Task<string> AuthenticatePlayerAsync()
//    {
//        var uniqueEmail = $"video-{Guid.NewGuid()}@test.com";
//        var password = "Password123!";

//        // 1. Register
//        var registerCommand = new Jogo.Application.Features.Authentication.Register.RegisterCommand(uniqueEmail, password, "Player");
//        await _client.PostAsJsonAsync("/api/v1/auth/register", registerCommand);

//        // 2. Login
//        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new
//        {
//            Email = uniqueEmail,
//            Password = password
//        });
//        loginResponse.EnsureSuccessStatusCode();

//        var content = await loginResponse.Content.ReadFromJsonAsync<Jogo.Application.Features.Authentication.Login.LoginResponse>();
//        var token = content!.AccessToken;

//        // 3. Create profile
//        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
//        var profileCommand = new Jogo.Application.Features.Player.CreateProfile.CreateProfileCommand(
//            "Test Player",
//            DateTime.Today.AddYears(-20),
//            Jogo.Domain.Enums.Position.Striker,
//            Jogo.Domain.Enums.PreferredFoot.Right,
//            "Country");
//        var profileResponse = await _client.PostAsJsonAsync("/api/v1/player/profile", profileCommand);
//        profileResponse.EnsureSuccessStatusCode();

//        return token;
//    }

//    [Fact]
//    public async Task UploadVideo_AsPlayer_ReturnsId()
//    {
//        // 1. Authenticate
//        var token = await AuthenticatePlayerAsync();
//        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

//        // 2. Prepare multipart form data
//        using var content = new MultipartFormDataContent();

//        // Create a dummy video file content
//        var fileContent = new ByteArrayContent(new byte[] { 0x01, 0x02, 0x03, 0x04 });
//        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("video/mp4");

//        content.Add(fileContent, "file", "test_video.mp4");

//        // 3. Act
//        var response = await _client.PostAsync("/api/v1/videos", content);

//        // 4. Assert
//        response.StatusCode.Should().Be(HttpStatusCode.OK);

//        var responseString = await response.Content.ReadAsStringAsync();
//        responseString.Should().Contain("id");
//    }
//}