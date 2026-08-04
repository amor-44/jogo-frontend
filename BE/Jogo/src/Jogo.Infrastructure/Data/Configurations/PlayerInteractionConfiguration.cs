using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class PlayerInteractionConfiguration : IEntityTypeConfiguration<PlayerInteraction>
    {
        public void Configure(EntityTypeBuilder<PlayerInteraction> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Player)
                   .WithMany()
                   .HasForeignKey(x => x.PlayerId);

            //builder.HasOne(x => x.Organization)
            //       .WithMany()
            //       .HasForeignKey(x => x.OrganizationId);
        }
    }
}


