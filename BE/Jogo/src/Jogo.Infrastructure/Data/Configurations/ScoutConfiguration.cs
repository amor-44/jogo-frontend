using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class ScoutConfiguration : IEntityTypeConfiguration<Scout>
    {
        public void Configure(EntityTypeBuilder<Scout> builder)
        {
            builder.Property(x => x.Location)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.PreviousOrganizations)
                .HasMaxLength(500);
        }
    }
}


