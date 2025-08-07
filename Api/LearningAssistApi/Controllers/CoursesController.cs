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
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ILogger<CoursesController> _logger;

        public CoursesController(ICourseService courseService, ILogger<CoursesController> logger)
        {
            _courseService = courseService;
            _logger = logger;
        }

        /// <summary>
        /// Get all courses with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<CourseListDto>>>> GetCourses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? categories = null,
            [FromQuery] DifficultyLevel? difficulty = null,
            [FromQuery] string? tags = null,
            [FromQuery] bool? isFeatured = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? instructorId = null)
        {
            try
            {
                // Parse comma-separated values
                var categoryList = !string.IsNullOrEmpty(categories) 
                    ? categories.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : null;
                var tagList = !string.IsNullOrEmpty(tags) 
                    ? tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : null;

                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetCoursesAsync(
                    page, pageSize, categoryList, difficulty, tagList, isFeatured, searchTerm, instructorId, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting courses");
                return StatusCode(500, ApiResponse<PaginatedResponse<CourseListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get specific course details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CourseDto>>> GetCourse(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetCourseByIdAsync(id, currentUserId);

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
                _logger.LogError(ex, "Error getting course {CourseId}", id);
                return StatusCode(500, ApiResponse<CourseDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Create new course (Admin/Instructor only)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CourseDto>>> CreateCourse([FromBody] CreateCourseDto createDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var userName = GetCurrentUserName();
                
                var result = await _courseService.CreateCourseAsync(createDto, currentUserId, userName);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetCourse), new { id = result.Data!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return StatusCode(500, ApiResponse<CourseDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Update course (Admin/Instructor only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CourseDto>>> UpdateCourse(string id, [FromBody] UpdateCourseDto updateDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.UpdateCourseAsync(id, updateDto, currentUserId);

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
                _logger.LogError(ex, "Error updating course {CourseId}", id);
                return StatusCode(500, ApiResponse<CourseDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Delete course (Admin/Instructor only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCourse(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.DeleteCourseAsync(id, currentUserId);

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
                _logger.LogError(ex, "Error deleting course {CourseId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get featured courses
        /// </summary>
        [HttpGet("featured")]
        public async Task<ActionResult<ApiResponse<List<CourseListDto>>>> GetFeaturedCourses([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetFeaturedCoursesAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured courses");
                return StatusCode(500, ApiResponse<List<CourseListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get recent courses
        /// </summary>
        [HttpGet("recent")]
        public async Task<ActionResult<ApiResponse<List<CourseListDto>>>> GetRecentCourses([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetRecentCoursesAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent courses");
                return StatusCode(500, ApiResponse<List<CourseListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get popular courses
        /// </summary>
        [HttpGet("popular")]
        public async Task<ActionResult<ApiResponse<List<CourseListDto>>>> GetPopularCourses([FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetPopularCoursesAsync(limit, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular courses");
                return StatusCode(500, ApiResponse<List<CourseListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get instructor's courses
        /// </summary>
        [HttpGet("instructor/{instructorId}")]
        public async Task<ActionResult<ApiResponse<List<CourseListDto>>>> GetInstructorCourses(string instructorId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _courseService.GetInstructorCoursesAsync(instructorId, currentUserId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting instructor courses for {InstructorId}", instructorId);
                return StatusCode(500, ApiResponse<List<CourseListDto>>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Enroll in course
        /// </summary>
        [HttpPost("{id}/enroll")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> EnrollInCourse(string id, [FromBody] EnrollInCourseDto? enrollDto = null)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var userName = GetCurrentUserName();
                
                var result = await _courseService.EnrollInCourseAsync(id, currentUserId, userName, enrollDto?.LearningPathId);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling user in course {CourseId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Unenroll from course
        /// </summary>
        [HttpPost("{id}/unenroll")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> UnenrollFromCourse(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.UnenrollFromCourseAsync(id, currentUserId);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unenrolling user from course {CourseId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's enrollment for specific course
        /// </summary>
        [HttpGet("{id}/enrollment")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentDto>>> GetEnrollment(string id)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.GetEnrollmentAsync(id, currentUserId);

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
                _logger.LogError(ex, "Error getting enrollment for course {CourseId}", id);
                return StatusCode(500, ApiResponse<CourseEnrollmentDto>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Update course progress
        /// </summary>
        [HttpPost("{id}/progress")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateCourseProgress(string id, [FromBody] UpdateProgressDto progressDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.UpdateCourseProgressAsync(id, currentUserId, progressDto);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course progress for course {CourseId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Rate course
        /// </summary>
        [HttpPost("{id}/rate")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> RateCourse(string id, [FromBody] RateCourseDto ratingDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.RateCourseAsync(id, currentUserId, ratingDto);

                if (!result.IsSuccess)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rating course {CourseId}", id);
                return StatusCode(500, ApiResponse<bool>.Failure("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's course enrollments
        /// </summary>
        [HttpGet("enrollments")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<CourseEnrollmentDto>>>> GetUserEnrollments([FromQuery] EnrollmentStatus? status = null)
        {
            try
            {
                var currentUserId = GetCurrentUserId()!;
                var result = await _courseService.GetUserEnrollmentsAsync(currentUserId, status);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user enrollments");
                return StatusCode(500, ApiResponse<List<CourseEnrollmentDto>>.Failure("Internal server error"));
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

    // Supporting DTOs
    public class EnrollInCourseDto
    {
        public string? LearningPathId { get; set; }
    }
}
