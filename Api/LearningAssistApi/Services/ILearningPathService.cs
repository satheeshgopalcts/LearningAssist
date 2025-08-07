using LearningAssistApi.DTOs;
using LearningAssistApi.Models;

namespace LearningAssistApi.Services
{
    public interface ILearningPathService
    {
        Task<ApiResponse<PaginatedResponse<LearningPathListDto>>> GetLearningPathsAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? careerGoals = null,
            List<string>? skills = null,
            DifficultyLevel? difficulty = null,
            LearningPathType? type = null,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? createdBy = null,
            string? currentUserId = null);

        Task<ApiResponse<LearningPathDto>> GetLearningPathByIdAsync(string id, string? currentUserId = null);
        Task<ApiResponse<LearningPathDto>> CreateLearningPathAsync(CreateLearningPathDto createDto, string createdBy, string createdByName);
        Task<ApiResponse<LearningPathDto>> UpdateLearningPathAsync(string id, UpdateLearningPathDto updateDto, string currentUserId);
        Task<ApiResponse<bool>> DeleteLearningPathAsync(string id, string currentUserId);
        Task<ApiResponse<List<LearningPathListDto>>> GetFeaturedLearningPathsAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<LearningPathListDto>>> GetRecentLearningPathsAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<LearningPathListDto>>> GetPopularLearningPathsAsync(int limit = 10, string? currentUserId = null);
        Task<ApiResponse<List<LearningPathListDto>>> GetUserLearningPathsAsync(string createdBy, string? currentUserId = null);
        Task<ApiResponse<bool>> EnrollInLearningPathAsync(string pathId, string userId, string userName);
        Task<ApiResponse<bool>> UnenrollFromLearningPathAsync(string pathId, string userId);
        Task<ApiResponse<LearningPathEnrollmentDto>> GetLearningPathEnrollmentAsync(string pathId, string userId);
        Task<ApiResponse<List<LearningPathEnrollmentDto>>> GetUserLearningPathEnrollmentsAsync(string userId);
        Task<ApiResponse<bool>> RateLearningPathAsync(string pathId, string userId, RateLearningPathDto ratingDto);
    }
}
