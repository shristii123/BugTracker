using System.Security.Claims;
using BugTracker.API.DTOs;
using BugTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BugTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BugsController : ControllerBase
{
    private readonly IBugService _bugs;
    public BugsController(IBugService bugs) => _bugs = bugs;

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
}
