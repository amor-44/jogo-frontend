public class TokenTransaction
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    public TransactionType TransactionType { get; set; }
    public int TokensCount { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}
