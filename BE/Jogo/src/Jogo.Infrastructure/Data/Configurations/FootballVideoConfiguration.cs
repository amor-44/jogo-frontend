using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class FootballVideoConfiguration : IEntityTypeConfiguration<FootballVideo>
    {
        public void Configure(EntityTypeBuilder<FootballVideo> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.VideoUrl)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(x => x.Duration)
                .IsRequired();

            builder.Property(x => x.UploadDate)
                .IsRequired();
            builder.Property(x => x.RowVersion)
           .IsRowVersion();

            builder.HasOne(x => x.Player)
                .WithMany(x => x.Videos)
                .HasForeignKey(x => x.PlayerId);

            builder.HasOne(x => x.Report)
                .WithOne(x => x.Video)
                .HasForeignKey<AIReport>(x => x.VideoId);
        }
    }
}


