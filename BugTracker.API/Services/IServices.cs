using BugTracker.API.DTOs;

namespace BugTracker.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}

public interface IBugService
{
    Task<BugDto> CreateAsync(CreateBugDto dto, string reporterId);
    Task<BugDto?> GetByIdAsync(int id);
    Task<List<BugDto>> GetAllAsync(string? search = null);
    Task<List<BugDto>> GetUnassignedAsync(string? search = null);
    Task<List<BugDto>> GetMyBugsAsync(string userId);
    Task<BugDto?> AssignToMeAsync(int bugId, string developerId);
    Task<BugDto?> UpdateStatusAsync(int bugId, string status, string userId);
    Task<BugDto?> AddAttachmentAsync(int bugId, IFormFile file, string userId);
}
