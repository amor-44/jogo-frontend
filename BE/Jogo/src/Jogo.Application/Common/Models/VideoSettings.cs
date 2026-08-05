namespace Jogo.Application.Common.Models;

public class VideoSettings
{
    public const string SectionName = "VideoSettings";
    
    public List<string> AllowedFormats { get; set; } = new List<string> { ".mp4", ".mov" };
    public long MaxSizeBytes { get; set; } = 104857600; // 100 MB
}
