using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using LearningAssistApi.DTOs;
using LearningAssistApi.Services;

namespace LearningAssistApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<ActionResult<ApiResponseDto<UserProfileDto>>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userService.GetUserProfileAsync(userId);

                return Ok(new ApiResponseDto<UserProfileDto>
                {
                    Success = true,
                    Message = "Profile retrieved successfully",
                    Data = profile
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<UserProfileDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user profile");
                return StatusCode(500, new ApiResponseDto<UserProfileDto>
                {
                    Success = false,
                    Message = "An error occurred while retrieving the profile"
                });
            }
        }

        /// <summary>
        /// Update current user profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<ActionResult<ApiResponseDto<UserProfileDto>>> UpdateProfile([FromBody] UpdateUserProfileDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<UserProfileDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var userId = GetCurrentUserId();
                var profile = await _userService.UpdateUserProfileAsync(userId, updateDto);

                return Ok(new ApiResponseDto<UserProfileDto>
                {
                    Success = true,
                    Message = "Profile updated successfully",
                    Data = profile
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<UserProfileDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user profile");
                return StatusCode(500, new ApiResponseDto<UserProfileDto>
                {
                    Success = false,
                    Message = "An error occurred while updating the profile"
                });
            }
        }

        /// <summary>
        /// Delete current user account
        /// </summary>
        [HttpDelete("profile")]
        public async Task<ActionResult<ApiResponseDto<object>>> DeleteAccount([FromBody] DeleteAccountDto deleteDto)
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

                var userId = GetCurrentUserId();
                var result = await _userService.DeleteUserAccountAsync(userId, deleteDto);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "Account deleted successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Failed to delete account"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting user account");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting the account"
                });
            }
        }

        /// <summary>
        /// Get current user preferences
        /// </summary>
        [HttpGet("preferences")]
        public async Task<ActionResult<ApiResponseDto<UserPreferencesDto>>> GetPreferences()
        {
            try
            {
                var userId = GetCurrentUserId();
                var preferences = await _userService.GetUserPreferencesAsync(userId);

                return Ok(new ApiResponseDto<UserPreferencesDto>
                {
                    Success = true,
                    Message = "Preferences retrieved successfully",
                    Data = preferences
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<UserPreferencesDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user preferences");
                return StatusCode(500, new ApiResponseDto<UserPreferencesDto>
                {
                    Success = false,
                    Message = "An error occurred while retrieving preferences"
                });
            }
        }

        /// <summary>
        /// Update current user preferences
        /// </summary>
        [HttpPut("preferences")]
        public async Task<ActionResult<ApiResponseDto<UserPreferencesDto>>> UpdatePreferences([FromBody] UpdateUserPreferencesDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponseDto<UserPreferencesDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
                    });
                }

                var userId = GetCurrentUserId();
                var preferences = await _userService.UpdateUserPreferencesAsync(userId, updateDto);

                return Ok(new ApiResponseDto<UserPreferencesDto>
                {
                    Success = true,
                    Message = "Preferences updated successfully",
                    Data = preferences
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<UserPreferencesDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user preferences");
                return StatusCode(500, new ApiResponseDto<UserPreferencesDto>
                {
                    Success = false,
                    Message = "An error occurred while updating preferences"
                });
            }
        }

        /// <summary>
        /// Get basic user info (for current user)
        /// </summary>
        [HttpGet("basic-info")]
        public async Task<ActionResult<ApiResponseDto<UserBasicInfoDto>>> GetBasicInfo()
        {
            try
            {
                var userId = GetCurrentUserId();
                var basicInfo = await _userService.GetUserBasicInfoAsync(userId);

                return Ok(new ApiResponseDto<UserBasicInfoDto>
                {
                    Success = true,
                    Message = "Basic info retrieved successfully",
                    Data = basicInfo
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<UserBasicInfoDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user basic info");
                return StatusCode(500, new ApiResponseDto<UserBasicInfoDto>
                {
                    Success = false,
                    Message = "An error occurred while retrieving basic info"
                });
            }
        }

        /// <summary>
        /// Update profile picture
        /// </summary>
        [HttpPut("profile-picture")]
        public async Task<ActionResult<ApiResponseDto<object>>> UpdateProfilePicture([FromBody] UpdateProfilePictureDto updateDto)
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

                var userId = GetCurrentUserId();
                var result = await _userService.UpdateProfilePictureAsync(userId, updateDto.ProfilePictureUrl);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "Profile picture updated successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Failed to update profile picture"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating profile picture");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while updating profile picture"
                });
            }
        }

        /// <summary>
        /// Get list of users (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApiResponseDto<List<UserBasicInfoDto>>>> GetUsers(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var users = await _userService.GetUsersAsync(page, pageSize, searchTerm);

                return Ok(new ApiResponseDto<List<UserBasicInfoDto>>
                {
                    Success = true,
                    Message = "Users retrieved successfully",
                    Data = users
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving users");
                return StatusCode(500, new ApiResponseDto<List<UserBasicInfoDto>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving users"
                });
            }
        }

        /// <summary>
        /// Deactivate user account (Admin only)
        /// </summary>
        [HttpPut("{userId}/deactivate")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApiResponseDto<object>>> DeactivateUser(string userId)
        {
            try
            {
                var result = await _userService.DeactivateUserAsync(userId);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "User deactivated successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Failed to deactivate user"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deactivating user");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while deactivating user"
                });
            }
        }

        /// <summary>
        /// Reactivate user account (Admin only)
        /// </summary>
        [HttpPut("{userId}/reactivate")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ApiResponseDto<object>>> ReactivateUser(string userId)
        {
            try
            {
                var result = await _userService.ReactivateUserAsync(userId);

                if (result)
                {
                    return Ok(new ApiResponseDto<object>
                    {
                        Success = true,
                        Message = "User reactivated successfully"
                    });
                }

                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Failed to reactivate user"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while reactivating user");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "An error occurred while reactivating user"
                });
            }
        }

        private string GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return userIdClaim;
        }
    }

    public class UpdateProfilePictureDto
    {
        [Required]
        [Url]
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }
}
