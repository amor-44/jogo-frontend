using Hangfire;

using Jogo.Api.Extensions.DependencyInjection;
using Jogo.Infrastructure.Data;

using Scalar.AspNetCore;

using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ إضافة خدمة الـ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5174",
                  "http://localhost:5173",
                  "http://localhost:3000",
                  "https://jogo-frontend-ghcq.vercel.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.
builder
    .Services.AddPresentation(builder.Configuration)
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Host.UseSerilog(
    (context, loggerConfig) => loggerConfig.ReadFrom.Configuration(context.Configuration));

var app = builder.Build();

// 2️⃣ تفعيل الـ CORS في بداية الـ Pipeline
app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Jogo API V1");

        options.EnableDeepLinking();
        options.DisplayRequestDuration();
        options.EnableFilter();
    });

    app.MapScalarApiReference();

    await app.InitialiseDatabaseAsync();
}
else
{
    app.UseHsts();
}

app.UseCoreMiddlewares(builder.Configuration);
app.UseAntiforgery();
app.UseHangfireDashboard();
app.MapPrometheusScrapingEndpoint();
app.MapControllers();
app.MapStaticAssets();

app.Run();