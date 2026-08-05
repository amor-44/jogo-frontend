using Jogo.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PlayerProfile> PlayerProfiles { get; }
    DbSet<ScoutProfile> ScoutProfiles { get; }
    DbSet<FootballVideo> FootballVideos { get; }
    DbSet<AnalysisReport> AnalysisReports { get; }
    DbSet<ContactRequest> ContactRequests { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
