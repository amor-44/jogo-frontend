using System.Text.Json;
using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jogo.Infrastructure.Data.Configurations;

public class AnalysisReportConfiguration : IEntityTypeConfiguration<AnalysisReport>
{
    public void Configure(EntityTypeBuilder<AnalysisReport> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Summary).IsRequired().HasMaxLength(2000);
        builder.Property(t => t.AIModelVersion).IsRequired().HasMaxLength(100);

        var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        builder.Property(t => t.Strengths)
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
            );

        builder.Property(t => t.Weaknesses)
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
            );

        builder.Property(t => t.Recommendations)
            .HasConversion(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
            );
    }
}
