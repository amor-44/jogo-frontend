public class ContactUnlock
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public int TokensUsed { get; set; }
    public DateTime UnlockDate { get; set; }
}
