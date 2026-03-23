namespace BugTracker.API.Models;

public enum Severity { Low, Medium, High }
public enum BugStatus { Open, InProgress, Resolved, Closed }

public class Bug
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ReproductionSteps { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public BugStatus Status { get; set; } = BugStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Reporter
    public string ReporterId { get; set; } = string.Empty;
    public AppUser Reporter { get; set; } = null!;

    // Assignee (optional)
    public string? AssigneeId { get; set; }
    public AppUser? Assignee { get; set; }

    public ICollection<BugAttachment> Attachments { get; set; } = new List<BugAttachment>();
}
