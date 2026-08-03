public class PlayerInteraction
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public InteractionType InteractionType { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}
