using System.Security.Claims;
using BugTracker.API.Data;
using BugTracker.API.DTOs;
using BugTracker.API.Models;
using BugTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BugTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BugsController : ControllerBase
{
    private readonly IBugService _bugs;
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public BugsController(IBugService bugs, UserManager<AppUser> userManager, AppDbContext db, IWebHostEnvironment env)
    {
        _bugs = bugs;
        _userManager = userManager;
        _db = db;
        _env = env;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private bool IsDeveloper => User.IsInRole("Developer");

    // GET api/bugs?search=xxx
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var bugs = await _bugs.GetAllAsync(search);
        return Ok(new ApiResponse<List<BugDto>>(true, "Success", bugs));
    }

    // GET api/bugs/unassigned?search=xxx  (Developer only)
    [HttpGet("unassigned")]
    [Authorize(Roles = "Developer")]
    public async Task<IActionResult> GetUnassigned([FromQuery] string? search)
    {
        var bugs = await _bugs.GetUnassignedAsync(search);
        return Ok(new ApiResponse<List<BugDto>>(true, "Success", bugs));
    }

    // GET api/bugs/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var bugs = await _bugs.GetMyBugsAsync(UserId);
        return Ok(new ApiResponse<List<BugDto>>(true, "Success", bugs));
    }

    // GET api/bugs/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var bug = await _bugs.GetByIdAsync(id);
        if (bug == null) return NotFound(new ApiResponse<string>(false, "Bug not found.", null));
        return Ok(new ApiResponse<BugDto>(true, "Success", bug));
    }

    // POST api/bugs  (User / Developer can report)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBugDto dto)
    {
        var bug = await _bugs.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = bug.Id },
            new ApiResponse<BugDto>(true, "Bug reported successfully.", bug));
    }

    // PUT api/bugs/5/assign  (Developer only)
    [HttpPut("{id}/assign")]
    [Authorize(Roles = "Developer")]
    public async Task<IActionResult> AssignToMe(int id)
    {
        var bug = await _bugs.AssignToMeAsync(id, UserId);
        if (bug == null) return BadRequest(new ApiResponse<string>(false, "Bug not found or already assigned.", null));
        return Ok(new ApiResponse<BugDto>(true, "Bug assigned.", bug));
    }

    // PUT api/bugs/5/status  (Assigned Developer only)
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Developer")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBugStatusDto dto)
    {
        var bug = await _bugs.UpdateStatusAsync(id, dto.Status, UserId);
        if (bug == null) return BadRequest(new ApiResponse<string>(false, "Cannot update. Check bug ownership.", null));
        return Ok(new ApiResponse<BugDto>(true, "Status updated.", bug));
    }

    // POST api/bugs/5/attachments
    [HttpPost("{id}/attachments")]
    public async Task<IActionResult> AddAttachment(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<string>(false, "No file provided.", null));

        var bug = await _bugs.AddAttachmentAsync(id, file, UserId);
        if (bug == null) return NotFound(new ApiResponse<string>(false, "Bug not found.", null));
        return Ok(new ApiResponse<BugDto>(true, "Attachment added.", bug));
    }

    // GET api/bugs/developers
    [HttpGet("developers")]
    public async Task<IActionResult> GetDevelopers()
    {
        var developers = await _userManager.GetUsersInRoleAsync("Developer");
        var result = developers.Select(d => new { d.Id, d.FullName, d.Email });
        return Ok(new ApiResponse<object>(true, "Success", result));
    }

    // GET api/bugs/attachments/download/{attachmentId}
    [HttpGet("attachments/download/{attachmentId}")]
    public async Task<IActionResult> DownloadAttachment(int attachmentId)
    {
        var attachment = await _db.BugAttachments.FindAsync(attachmentId);
        if (attachment == null) return NotFound();

        var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", Path.GetFileName(attachment.FilePath));

        if (!System.IO.File.Exists(filePath))
            return NotFound(new ApiResponse<string>(false, "File not found on server.", null));

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, attachment.ContentType, attachment.FileName);
    }
}
