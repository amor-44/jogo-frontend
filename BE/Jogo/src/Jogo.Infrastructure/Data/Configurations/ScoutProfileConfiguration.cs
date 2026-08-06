using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations;

public class ScoutProfileConfiguration : IEntityTypeConfiguration<ScoutProfile>
{
    public void Configure(EntityTypeBuilder<ScoutProfile> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Organization).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Country).IsRequired().HasMaxLength(100);
        builder.HasOne<User>()
        .WithOne()
       .HasForeignKey<ScoutProfile>(x => x.UserId);

        builder.HasMany(x => x.ContactRequests)
            .WithOne(x => x.ScoutProfile)
            .HasForeignKey(x => x.ScoutProfileId);
    }
}
