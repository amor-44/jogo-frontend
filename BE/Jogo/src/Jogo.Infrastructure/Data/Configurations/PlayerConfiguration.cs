using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class PlayerConfiguration : IEntityTypeConfiguration<Player>
    {
        public void Configure(EntityTypeBuilder<Player> builder)
        {
            builder.Property(x => x.Position)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Location)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.CurrentTeam)
                .HasMaxLength(100);

            builder.Property(x => x.FootballExperience)
                .HasMaxLength(500);

            builder.HasMany(x => x.Videos)
                .WithOne(x => x.Player)
                .HasForeignKey(x => x.PlayerId);

            builder.HasMany(x => x.ContactUnlocks)
                .WithOne(x => x.Player)
                .HasForeignKey(x => x.PlayerId);
        }
    }

}


