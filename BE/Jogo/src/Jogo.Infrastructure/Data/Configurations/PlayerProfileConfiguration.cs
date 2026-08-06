using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations;

public class PlayerProfileConfiguration : IEntityTypeConfiguration<PlayerProfile>
{
    public void Configure(EntityTypeBuilder<PlayerProfile> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.FullName).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Country).IsRequired().HasMaxLength(100);
        builder.Property(t => t.City).HasMaxLength(100);
        builder.Property(t => t.CurrentClub).HasMaxLength(200);
        builder.Property(t => t.Biography).HasMaxLength(Domain.Common.Constants.JogoConstants.MaxBiographyLength);
        builder.Property(t => t.ProfilePictureUrl).HasMaxLength(1000);

        builder.Property(t => t.Height).HasPrecision(5, 2);
        builder.Property(t => t.Weight).HasPrecision(5, 2);

        builder.Property(t => t.PreferredFoot).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.PrimaryPosition).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.SecondaryPosition).HasConversion<string>().HasMaxLength(50);
        builder.Property(t => t.Visibility).HasConversion<string>().HasMaxLength(50);
    }
}
