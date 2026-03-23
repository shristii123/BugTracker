namespace BugTracker.API.DTOs;

// ── Auth ──────────────────────────────────────────────
public record RegisterDto(string FullName, string Email, string Password, string Role);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Email, string FullName, string Role);

// ── Bug ───────────────────────────────────────────────
public record CreateBugDto(
    string Title,
    string Description,
    string ReproductionSteps,
    string Severity,  // "Low" | "Medium" | "High"
    string? AssigneeId
);

public record UpdateBugStatusDto(string Status); // "Open"|"InProgress"|"Resolved"|"Closed"

public record BugDto(
    int Id,
    string Title,
    string Description,
    string ReproductionSteps,
    string Severity,
    string Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string ReporterName,
    string? AssigneeName,
    List<AttachmentDto> Attachments
);

public record AttachmentDto(int Id, string FileName, long FileSize, DateTime UploadedAt);

// ── Generic ───────────────────────────────────────────
public record ApiResponse<T>(bool Success, string Message, T? Data);
