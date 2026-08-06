using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations;

public class FootballVideoConfiguration : IEntityTypeConfiguration<FootballVideo>
{
    public void Configure(EntityTypeBuilder<FootballVideo> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StorageUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.OriginalFileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Duration)
            .IsRequired();

        builder.Property(x => x.UploadedAt)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasOne<PlayerProfile>()
            .WithMany()
            .HasForeignKey(x => x.PlayerProfileId);
        builder.HasOne(x => x.PlayerProfile)
       .WithMany(x => x.FootballVideos)
        .HasForeignKey(x => x.PlayerProfileId);

        builder.HasOne(x => x.AnalysisReport)
            .WithOne(x => x.FootballVideo)
            .HasForeignKey<AnalysisReport>(x => x.VideoId);
    }
}
