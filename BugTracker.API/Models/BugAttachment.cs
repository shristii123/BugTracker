namespace BugTracker.API.Models;

public class BugAttachment
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int BugId { get; set; }
    public Bug Bug { get; set; } = null!;
}
