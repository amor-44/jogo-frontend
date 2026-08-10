using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations;

public class ContactRequestConfiguration : IEntityTypeConfiguration<ContactRequest>
{
    public void Configure(EntityTypeBuilder<ContactRequest> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(50);
        builder.HasOne(x => x.PlayerProfile)
            .WithMany(x => x.ContactRequests)
            .HasForeignKey(x => x.PlayerProfileId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.ScoutProfile)
            .WithMany(x => x.ContactRequests)
            .HasForeignKey(x => x.ScoutProfileId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
