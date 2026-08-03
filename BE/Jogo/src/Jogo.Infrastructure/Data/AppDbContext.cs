using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common;

using MechanicShop.Application.Common.Interfaces;

using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options, IMediator mediator)
    : IdentityDbContext<IdentityUser>(options),
        IAppDbContext
{
    public DbSet<Player> Players => Set<Player>();

    public DbSet<Organization> Organizations => Set<Organization>();

    public DbSet<Scout> Scouts => Set<Scout>();

    public DbSet<FootballVideo> FootballVideos => Set<FootballVideo>();

    public DbSet<AIReport> AIReports => Set<AIReport>();

    public DbSet<PlayerInsight> PlayerInsights => Set<PlayerInsight>();

    public DbSet<ContactUnlock> ContactUnlocks => Set<ContactUnlock>();

    public DbSet<PlayerInteraction> PlayerInteractions => Set<PlayerInteraction>();

    public DbSet<TokenTransaction> TokenTransactions => Set<TokenTransaction>();
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await DispatchDomainEventsAsync(cancellationToken);
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    private async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var domainEntities = ChangeTracker
            .Entries()
            .Where(e => e.Entity is Entity baseEntity && baseEntity.DomainEvents.Count != 0)
            .Select(e => (Entity)e.Entity)
            .ToList();

        var domainEvents = domainEntities.SelectMany(e => e.DomainEvents).ToList();

        foreach (var domainEvent in domainEvents)
        {
            await mediator.Publish(domainEvent, cancellationToken);
        }

        foreach (var entity in domainEntities)
        {
            entity.ClearDomainEvents();
        }
    }
}
