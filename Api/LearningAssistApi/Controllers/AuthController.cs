using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LearningAssistApi.DTOs;
using LearningAssistApi.Services;

namespace LearningAssistApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<AuthResponseDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.RegisterAsync(registerDto);

                return Ok(new ApiResponseDto<AuthResponseDto>
                {
                    Success = true,
                    Message = "User registered successfully. Please check your email to verify your account.",
                    Data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during registration");
                return StatusCode(500, new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        /// <summary>
        /// Login user
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<AuthResponseDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.LoginAsync(loginDto);

                return Ok(new ApiResponseDto<AuthResponseDto>
                {
                    Success = true,
                    Message = "Login successful",
                    Data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login");
                return StatusCode(500, new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        /// <summary>
        /// Refresh access token
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<AuthResponseDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);

                return Ok(new ApiResponseDto<AuthResponseDto>
                {
                    Success = true,
                    Message = "Token refreshed successfully",
                    Data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during token refresh");
                return StatusCode(500, new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = "An error occurred during token refresh"
                });
            }
        }

        /// <summary>
        /// Logout user
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<ApiResponseDto<object>>> Logout([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid user"
                    });
                }

                var result = await _authService.LogoutAsync(userId, refreshTokenDto.RefreshToken);

                return Ok(new ApiResponseDto<object>
                {
                    Success = result,
                    Message = result ? "Logout successful" : "Logout failed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during logout");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred during logout"
                });
            }
        }

        /// <summary>
        /// Request password reset
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponseDto<object>>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Message = "If the email exists in our system, you will receive a password reset link shortly."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during forgot password");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while processing your request"
                });
            }
        }

        /// <summary>
        /// Reset password with token
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponseDto<object>>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.ResetPasswordAsync(resetPasswordDto);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "Password reset successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Invalid or expired reset token"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during password reset");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while resetting password"
                });
            }
        }

        /// <summary>
        /// Change password (authenticated)
        /// </summary>
        [HttpPut("change-password")]
        [Authorize]
        public async Task<ActionResult<ApiResponseDto<object>>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Invalid user"
                    });
                }

                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "Password changed successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Current password is incorrect"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during password change");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while changing password"
                });
            }
        }

        /// <summary>
        /// Verify email with token
        /// </summary>
        [HttpGet("verify-email")]
        public async Task<ActionResult<ApiResponseDto<object>>> VerifyEmail([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Token is required"
                    });
                }

                var result = await _authService.VerifyEmailAsync(token);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "Email verified successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Invalid or expired verification token"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during email verification");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while verifying email"
                });
            }
        }

        /// <summary>
        /// Social login (Google/LinkedIn)
        /// </summary>
        [HttpPost("social-login")]
        public async Task<ActionResult<ApiResponseDto<AuthResponseDto>>> SocialLogin([FromBody] SocialLoginDto socialLoginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<AuthResponseDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var result = await _authService.SocialLoginAsync(socialLoginDto);

                return Ok(new ApiResponseDto<AuthResponseDto>
                {
                    Success = true,
                    Message = "Social login successful",
                    Data = result
                });
            }
            catch (NotImplementedException)
            {
                return BadRequest(new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = "Social login not implemented yet"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during social login");
                return StatusCode(500, new ApiResponseDto<AuthResponseDto>
                {
                    Success = false,
                    Message = "An error occurred during social login"
                });
            }
        }
    }
}
