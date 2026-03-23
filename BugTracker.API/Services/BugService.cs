using BugTracker.API.Data;
using BugTracker.API.DTOs;
using BugTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BugTracker.API.Services;

public class BugService : IBugService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public BugService(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    public async Task<BugDto> CreateAsync(CreateBugDto dto, string reporterId)
    {
        if (!Enum.TryParse<Severity>(dto.Severity, true, out var severity))
            severity = Severity.Low;

        var bug = new Bug
        {
            Title = dto.Title,
            Description = dto.Description,
            ReproductionSteps = dto.ReproductionSteps,
            Severity = severity,
            ReporterId = reporterId,
            AssigneeId = dto.AssigneeId,  
            Status = dto.AssigneeId != null ? BugStatus.InProgress : BugStatus.Open,
        };

        _db.Bugs.Add(bug);
        await _db.SaveChangesAsync();   
        return await GetByIdAsync(bug.Id) ?? throw new Exception("Bug not found after creation");
    }

    public async Task<BugDto?> GetByIdAsync(int id)
    {
        var bug = await _db.Bugs
            .Include(b => b.Reporter)
            .Include(b => b.Assignee)
            .Include(b => b.Attachments)
            .FirstOrDefaultAsync(b => b.Id == id);
        return bug == null ? null : MapToDto(bug);
    }

    public async Task<List<BugDto>> GetAllAsync(string? search = null)
    {
        var q = _db.Bugs
            .Include(b => b.Reporter)
            .Include(b => b.Assignee)
            .Include(b => b.Attachments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(b =>
                b.Title.ToLower().Contains(s) ||
                b.Description.ToLower().Contains(s) ||
                b.Status.ToString().ToLower().Contains(s) ||
                b.Severity.ToString().ToLower().Contains(s));
        }

        return await q.OrderByDescending(b => b.CreatedAt).Select(b => MapToDto(b)).ToListAsync();
    }

    public async Task<List<BugDto>> GetUnassignedAsync(string? search = null)
    {
        var q = _db.Bugs
            .Include(b => b.Reporter)
            .Include(b => b.Attachments)
            .Where(b => b.AssigneeId == null && b.Status == BugStatus.Open)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(b =>
                b.Title.ToLower().Contains(s) ||
                b.Severity.ToString().ToLower().Contains(s));
        }

        return await q.OrderByDescending(b => b.CreatedAt).Select(b => MapToDto(b)).ToListAsync();
    }

    public async Task<List<BugDto>> GetMyBugsAsync(string userId)
    {
        return await _db.Bugs
            .Include(b => b.Reporter)
            .Include(b => b.Assignee)
            .Include(b => b.Attachments)
            .Where(b => b.ReporterId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BugDto?> AssignToMeAsync(int bugId, string developerId)
    {
        var bug = await _db.Bugs.FindAsync(bugId);
        if (bug == null || bug.AssigneeId != null) return null;

        bug.AssigneeId = developerId;
        bug.Status = BugStatus.InProgress;
        bug.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(bugId);
    }

    public async Task<BugDto?> UpdateStatusAsync(int bugId, string status, string userId)
    {
        var bug = await _db.Bugs.FindAsync(bugId);
        if (bug == null) return null;
        if (bug.AssigneeId != userId) return null;

        if (!Enum.TryParse<BugStatus>(status, true, out var newStatus)) return null;

        bug.Status = newStatus;
        bug.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(bugId);
    }

    public async Task<BugDto?> AddAttachmentAsync(int bugId, IFormFile file, string userId)
    {
        // File size limit — 5MB
        const long maxSize = 5 * 1024 * 1024;
        if (file.Length > maxSize)
            throw new InvalidOperationException("File size exceeds the 5MB limit.");

        var bug = await _db.Bugs.FindAsync(bugId);
        if (bug == null) return null;

        var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var attachment = new BugAttachment
        {
            BugId = bugId,
            FileName = file.FileName,
            FilePath = $"/uploads/{fileName}",
            ContentType = file.ContentType,
            FileSize = file.Length,
        };

        _db.BugAttachments.Add(attachment);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(bugId);
    }

    private static BugDto MapToDto(Bug b) => new(
        b.Id, b.Title, b.Description, b.ReproductionSteps,
        b.Severity.ToString(), b.Status.ToString(),
        b.CreatedAt, b.UpdatedAt,
        b.Reporter?.FullName ?? "Unknown",
        b.Assignee?.FullName,
        b.Attachments.Select(a => new AttachmentDto(a.Id, a.FileName, a.FileSize, a.UploadedAt)).ToList()
    );
}
