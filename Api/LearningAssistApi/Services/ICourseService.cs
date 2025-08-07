using LearningAssistApi.DTOs;
using LearningAssistApi.Models;

namespace LearningAssistApi.Services
{
    public interface ICourseService
    {
        Task<ApiResponse<PaginatedResponse<CourseListDto>>> GetCoursesAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? categories = null,
            DifficultyLevel? difficulty = null,
            List<string>? tags = null,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? instructorId = null,
            string? currentUserId = null);

        Task<ApiResponse<CourseDto>> GetCourseByIdAsync(string id, string? currentUserId = null);
        Task<ApiResponse<CourseDto>> CreateCourseAsync(CreateCourseDto createDto, string instructorId, string instructorName);
        Task<ApiResponse<CourseDto>> UpdateCourseAsync(string id, UpdateCourseDto updateDto, string currentUserId);
        Task<ApiResponse<bool>> DeleteCourseAsync(string id, string currentUserId);
        Task<ApiResponse<List<CourseListDto>>> GetFeaturedCoursesAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<CourseListDto>>> GetRecentCoursesAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<CourseListDto>>> GetPopularCoursesAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<CourseListDto>>> GetInstructorCoursesAsync(string instructorId, string? currentUserId = null);
        Task<ApiResponse<bool>> EnrollInCourseAsync(string courseId, string userId, string userName, string? learningPathId = null);
        Task<ApiResponse<bool>> UnenrollFromCourseAsync(string courseId, string userId);
        Task<ApiResponse<CourseEnrollmentDto>> GetEnrollmentAsync(string courseId, string userId);
        Task<ApiResponse<List<CourseEnrollmentDto>>> GetUserEnrollmentsAsync(string userId, EnrollmentStatus? status = null);
        Task<ApiResponse<bool>> UpdateCourseProgressAsync(string courseId, string userId, UpdateProgressDto progressDto);
        Task<ApiResponse<bool>> RateCourseAsync(string courseId, string userId, RateCourseDto ratingDto);
    }
}
