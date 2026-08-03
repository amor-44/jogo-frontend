using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class ContactUnlockConfiguration : IEntityTypeConfiguration<ContactUnlock>
    {
        public void Configure(EntityTypeBuilder<ContactUnlock> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Player)
                   .WithMany(x => x.ContactUnlocks)
                   .HasForeignKey(x => x.PlayerId);

            builder.HasOne(x => x.Organization)
                   .WithMany()
                   .HasForeignKey(x => x.OrganizationId);
        }
    }
}


