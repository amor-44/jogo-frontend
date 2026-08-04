using FluentAssertions;
using Jogo.Application.Features.Authentication.Login;
using Jogo.Application.Features.Authentication.Refresh;
using Jogo.Application.Features.Authentication.Register;
using Microsoft.Extensions.DependencyInjection;
using Jogo.Infrastructure.Data;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Jogo.Api.IntegrationTests;

public class AuthenticationEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public AuthenticationEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task EndToEnd_Authentication_Flow()
    {
        // Setup Database
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
        }

        var uniqueEmail = $"test-{Guid.NewGuid()}@test.com";
        var password = "Password123!";

        // 1. Register
        var registerCommand = new RegisterCommand(uniqueEmail, password, "Player");
        var registerResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerCommand);
        
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // 2. Login
        var loginCommand = new LoginCommand(uniqueEmail, password);
        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", loginCommand);
        
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        
        loginResult.Should().NotBeNull();
        loginResult!.AccessToken.Should().NotBeNullOrEmpty();
        loginResult.RefreshToken.Should().NotBeNullOrEmpty();

        // 3. Refresh
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginResult.AccessToken);
        var refreshCommand = new RefreshCommand(loginResult.RefreshToken);
        var refreshResponse = await _client.PostAsJsonAsync("/api/v1/auth/refresh", refreshCommand);
        
        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var refreshResult = await refreshResponse.Content.ReadFromJsonAsync<RefreshResponse>();

        refreshResult.Should().NotBeNull();
        refreshResult!.AccessToken.Should().NotBeNullOrEmpty();
        refreshResult.RefreshToken.Should().NotBeNullOrEmpty();
        refreshResult.AccessToken.Should().NotBe(loginResult.AccessToken);
        refreshResult.RefreshToken.Should().NotBe(loginResult.RefreshToken);

        // 4. Logout
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", refreshResult.AccessToken);
        var logoutCommand = new Jogo.Application.Features.Authentication.Logout.LogoutCommand(refreshResult.RefreshToken);
        var logoutResponse = await _client.PostAsJsonAsync("/api/v1/auth/logout", logoutCommand);

        logoutResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
