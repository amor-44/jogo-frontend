using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class PlayerInsightConfiguration : IEntityTypeConfiguration<PlayerInsight>
    {
        public void Configure(EntityTypeBuilder<PlayerInsight> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title)
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(x => x.Description)
                   .HasMaxLength(1000)
                   .IsRequired();

            builder.HasOne(x => x.Report)
                   .WithMany(x => x.Insights)
                   .HasForeignKey(x => x.ReportId);
        }
    }
}


