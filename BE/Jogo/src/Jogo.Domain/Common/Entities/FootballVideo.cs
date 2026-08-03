public class FootballVideo
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public string VideoUrl { get; set; } = null!;
    public VideoType VideoType { get; set; }
    public ProcessingStatus ProcessingStatus { get; set; }
    public int Duration { get; set; }
    public DateTime UploadDate { get; set; }
    public AIReport? Report { get; set; }
    public byte[] RowVersion { get; set; } = [];
}
