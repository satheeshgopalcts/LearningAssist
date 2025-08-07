using LearningAssistApi.Models;

namespace LearningAssistApi.Repositories
{
    public interface ILearningPathRepository : IRepository<LearningPath>
    {
        Task<IEnumerable<LearningPath>> GetLearningPathsWithFiltersAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? careerGoals = null,
            List<string>? skills = null,
            DifficultyLevel? difficulty = null,
            LearningPathType? type = null,
            bool? isActive = true,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? createdBy = null);

        Task<LearningPath?> GetLearningPathWithCoursesAsync(string pathId);
        Task<IEnumerable<LearningPath>> GetLearningPathsByCreatorAsync(string creatorId);
        Task<IEnumerable<LearningPath>> GetFeaturedLearningPathsAsync(int limit = 10);
        Task<IEnumerable<LearningPath>> GetRecentLearningPathsAsync(int limit = 10);
        Task<IEnumerable<LearningPath>> GetPopularLearningPathsAsync(int limit = 10);
        Task<bool> UpdateLearningPathStatisticsAsync(string pathId, LearningPathStatistics statistics);
        Task<bool> IncrementEnrollmentAsync(string pathId);
        Task<bool> DecrementEnrollmentAsync(string pathId);
        Task<bool> UpdateLearningPathRatingAsync(string pathId, double newAverageRating, int totalRatings);
    }
}
