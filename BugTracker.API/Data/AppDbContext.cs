using BugTracker.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BugTracker.API.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Bug> Bugs => Set<Bug>();
    public DbSet<BugAttachment> BugAttachments => Set<BugAttachment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Bug>(b =>
        {
            b.HasOne(x => x.Reporter)
             .WithMany(u => u.ReportedBugs)
             .HasForeignKey(x => x.ReporterId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Assignee)
             .WithMany(u => u.AssignedBugs)
             .HasForeignKey(x => x.AssigneeId)
             .OnDelete(DeleteBehavior.SetNull)
             .IsRequired(false);

            b.Property(x => x.Severity).HasConversion<string>();
            b.Property(x => x.Status).HasConversion<string>();
        });

        builder.Entity<BugAttachment>(b =>
        {
            b.HasOne(x => x.Bug)
             .WithMany(bug => bug.Attachments)
             .HasForeignKey(x => x.BugId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
