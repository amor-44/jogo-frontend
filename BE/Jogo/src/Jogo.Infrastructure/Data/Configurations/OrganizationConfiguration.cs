using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
    {
        public void Configure(EntityTypeBuilder<Organization> builder)
        {
            builder.Property(x => x.OrganizationName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.Location)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.ContactInformation)
                .HasMaxLength(250)
                .IsRequired();

            builder.HasMany(x => x.Transactions)
                .WithOne(x => x.Organization)
                .HasForeignKey(x => x.OrganizationId);
        }
    }
}


