using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class AIReportConfiguration : IEntityTypeConfiguration<AIReport>
    {
        public void Configure(EntityTypeBuilder<AIReport> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.AIModelVersion)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.OverallScore).HasPrecision(5, 2);
            builder.Property(x => x.PassingAccuracy).HasPrecision(5, 2);
            builder.Property(x => x.BallControl).HasPrecision(5, 2);
            builder.Property(x => x.PositioningScore).HasPrecision(5, 2);
            builder.Property(x => x.MovementEfficiency).HasPrecision(5, 2);
            builder.Property(x => x.DefensiveActions).HasPrecision(5, 2);
            builder.Property(x => x.AttackingImpact).HasPrecision(5, 2);
            builder.Property(x => x.DecisionMaking).HasPrecision(5, 2);

            builder.HasOne(x => x.Video)
                   .WithOne(x => x.Report)
                   .HasForeignKey<AIReport>(x => x.VideoId);

            builder.HasMany(x => x.Insights)
                   .WithOne(x => x.Report)
                   .HasForeignKey(x => x.ReportId);
        }
    }
}


