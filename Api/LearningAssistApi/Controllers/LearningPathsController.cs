using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearningAssistApi.Services;
using LearningAssistApi.DTOs;
using LearningAssistApi.Models;
using System.Security.Claims;

namespace LearningAssistApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LearningPathsController : ControllerBase
    {
        private readonly ILearningPathService _learningPathService;
        private readonly ILogger<LearningPathsController> _logger;

        public LearningPathsController(ILearningPathService learningPathService, ILogger<LearningPathsController> logger)
        {
            _learningPathService = learningPathService;
            _logger = logger;
        }

        /// <summary>
        /// Get all learning paths with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<LearningPathListDto>>>> GetLearningPaths(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? careerGoals = null,
            [FromQuery] string? skills = null,
            [FromQuery] DifficultyLevel? difficulty = null,
            [FromQuery] LearningPathType? type = null,
            [FromQuery] bool? isFeatured = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? createdBy = null)
        {
            try
            {
                // Parse comma-separated values
                var careerGoalsList = !string.IsNullOrEmpty(careerGoals) 
                    ? careerGoals.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : null;
                var skillsList = !string.IsNullOrEmpty(skills) 
                    ? skills.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : null;

                var currentUserId = GetCurrentUserId();
                var result = await _learningPathService.GetLearningPathsAsync(
                    page, pageSize, careerGoalsList, skillsList, difficulty, type, isFeatured, searchTerm, createdBy, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning paths");
                return StatusCode(500, ApiResponse<PaginatedResponse<LearningPathListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get specific learning path details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<LearningPathDto>>> GetLearningPath(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _learningPathService.GetLearningPathByIdAsync(id, currentUserId);

                if (!result.IsSuccess)
                {
                    return result.StatusCode switch
                    {
                        404 => NotFound(result),
                        _ => BadRequest(result)
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning path {PathId}", id);
                return StatusCode(500, ApiResponse<LearningPathDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Create new learning path
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ApiResponse<LearningPathDto>>> CreateLearningPath([FromBody] CreateLearningPathDto createDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var userName = GetCurrentUserName();
                
                var result = await _learningPathService.CreateLearningPathAsync(createDto, currentUserId, userName);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetLearningPath), new { id = result.Data!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating learning path");
                return StatusCode(500, ApiResponse<LearningPathDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Update learning path
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<LearningPathDto>>> UpdateLearningPath(string id, [FromBody] UpdateLearningPathDto updateDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.UpdateLearningPathAsync(id, updateDto, currentUserId);

                if (!result.IsSuccess)
                {
                    return result.StatusCode switch
                    {
                        404 => NotFound(result),
                        403 => Forbid(),
                        _ => BadRequest(result)
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating learning path {PathId}", id);
                return StatusCode(500, ApiResponse<LearningPathDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Delete learning path
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteLearningPath(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.DeleteLearningPathAsync(id, currentUserId);

                if (!result.IsSuccess)
                {
                    return result.StatusCode switch
                    {
                        404 => NotFound(result),
                        403 => Forbid(),
                        _ => BadRequest(result)
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting learning path {PathId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get featured learning paths
        /// </summary>
        [HttpGet("featured")]
        public async Task<ActionResult<ApiResponse<List<LearningPathListDto>>>> GetFeaturedLearningPaths([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _learningPathService.GetFeaturedLearningPathsAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured learning paths");
                return StatusCode(500, ApiResponse<List<LearningPathListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get recent learning paths
        /// </summary>
        [HttpGet("recent")]
        public async Task<ActionResult<ApiResponse<List<LearningPathListDto>>>> GetRecentLearningPaths([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _learningPathService.GetRecentLearningPathsAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent learning paths");
                return StatusCode(500, ApiResponse<List<LearningPathListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get popular learning paths
        /// </summary>
        [HttpGet("popular")]
        public async Task<ActionResult<ApiResponse<List<LearningPathListDto>>>> GetPopularLearningPaths([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _learningPathService.GetPopularLearningPathsAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular learning paths");
                return StatusCode(500, ApiResponse<List<LearningPathListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's learning paths
        /// </summary>
        [HttpGet("my-paths")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<LearningPathListDto>>>> GetMyLearningPaths()
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.GetUserLearningPathsAsync(currentUserId, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user learning paths");
                return StatusCode(500, ApiResponse<List<LearningPathListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Enroll in learning path
        /// </summary>
        [HttpPost("{id}/enroll")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> EnrollInLearningPath(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var userName = GetCurrentUserName();
                
                var result = await _learningPathService.EnrollInLearningPathAsync(id, currentUserId, userName);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling user in learning path {PathId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Unenroll from learning path
        /// </summary>
        [HttpPost("{id}/unenroll")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> UnenrollFromLearningPath(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.UnenrollFromLearningPathAsync(id, currentUserId);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unenrolling user from learning path {PathId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's enrollment for specific learning path
        /// </summary>
        [HttpGet("{id}/enrollment")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<LearningPathEnrollmentDto>>> GetLearningPathEnrollment(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.GetLearningPathEnrollmentAsync(id, currentUserId);

                if (!result.IsSuccess)
                {
                    return result.StatusCode switch
                    {
                        404 => NotFound(result),
                        _ => BadRequest(result)
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning path enrollment for {PathId}", id);
                return StatusCode(500, ApiResponse<LearningPathEnrollmentDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's learning path enrollments
        /// </summary>
        [HttpGet("enrollments")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<LearningPathEnrollmentDto>>>> GetUserLearningPathEnrollments()
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.GetUserLearningPathEnrollmentsAsync(currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user learning path enrollments");
                return StatusCode(500, ApiResponse<List<LearningPathEnrollmentDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Rate learning path
        /// </summary>
        [HttpPost("{id}/rate")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> RateLearningPath(string id, [FromBody] RateLearningPathDto ratingDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _learningPathService.RateLearningPathAsync(id, currentUserId, ratingDto);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rating learning path {PathId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        private string? GetCurrentUserId()
        {
            return User.Identity?.IsAuthenticated == true 
                ? User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                : null;
        }

        private string GetCurrentUserName()
        {
            return User.FindFirst("name")?.Value ?? 
                   User.FindFirst(ClaimTypes.Name)?.Value ?? 
                   User.FindFirst("email")?.Value ?? 
                   "Unknown User";
        }
    }
}
