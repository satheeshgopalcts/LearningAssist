using LearningAssistApi.Models;
using LiteDB;

namespace LearningAssistApi.Repositories
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<IEnumerable<Course>> GetCoursesWithFiltersAsync(
            int page = 1, 
            int pageSize = 20, 
            List<string>? categories = null, 
            DifficultyLevel? difficulty = null, 
            List<string>? tags = null,
            bool? isActive = true,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? instructorId = null);
        
        Task<Course?> GetCourseWithModulesAsync(string courseId);
        Task<IEnumerable<Course>> GetCoursesByInstructorAsync(string instructorId);
        Task<IEnumerable<Course>> GetFeaturedCoursesAsync(int limit = 10);
        Task<IEnumerable<Course>> GetRecentCoursesAsync(int limit = 10);
        Task<IEnumerable<Course>> GetPopularCoursesAsync(int limit = 10);
        Task<bool> UpdateCourseStatisticsAsync(string courseId, CourseStatistics statistics);
        Task<bool> IncrementEnrollmentAsync(string courseId);
        Task<bool> DecrementEnrollmentAsync(string courseId);
        Task<bool> UpdateCourseRatingAsync(string courseId, double newAverageRating, int totalRatings);
    }
}
