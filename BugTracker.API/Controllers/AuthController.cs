using BugTracker.API.DTOs;
using BugTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BugTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (result == null)
            return BadRequest(new ApiResponse<string>(false, "Email already exists or registration failed.", null));

        return Ok(new ApiResponse<AuthResponseDto>(true, "Registration successful.", result));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new ApiResponse<string>(false, "Invalid email or password.", null));

        return Ok(new ApiResponse<AuthResponseDto>(true, "Login successful.", result));
    }
}
