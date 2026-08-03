using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations
{
    public class TokenTransactionConfiguration : IEntityTypeConfiguration<TokenTransaction>
    {
        public void Configure(EntityTypeBuilder<TokenTransaction> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Amount)
                   .HasPrecision(18, 2);
            builder.Property(x => x.RowVersion)
           .IsRowVersion();

            builder.HasOne(x => x.Organization)
                   .WithMany(x => x.Transactions)
                   .HasForeignKey(x => x.OrganizationId);
        }
    }
}


