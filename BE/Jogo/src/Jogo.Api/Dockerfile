# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Directory.Packages.props", "."]
COPY ["Directory.Build.props", "."]
COPY ["src/Jogo.Api/Jogo.Api.csproj", "src/Jogo.Api/"]
COPY ["src/Jogo.Contracts/Jogo.Contracts.csproj", "src/Jogo.Contracts/"]
COPY ["src/Jogo.Application/Jogo.Application.csproj", "src/Jogo.Application/"]
COPY ["src/Jogo.Domain/Jogo.Domain.csproj", "src/Jogo.Domain/"]
COPY ["src/Jogo.Infrastructure/Jogo.Infrastructure.csproj", "src/Jogo.Infrastructure/"]
RUN dotnet restore "./src/Jogo.Api/Jogo.Api.csproj"
COPY . .
WORKDIR "/src/src/Jogo.Api"
RUN dotnet build "./Jogo.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Jogo.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Jogo.Api.dll"]