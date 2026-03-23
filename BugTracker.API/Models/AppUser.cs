using Microsoft.AspNetCore.Identity;

namespace BugTracker.API.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public ICollection<Bug> ReportedBugs { get; set; } = new List<Bug>();
    public ICollection<Bug> AssignedBugs { get; set; } = new List<Bug>();
}
