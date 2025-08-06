using LearningAssistApi.DTOs;
using LearningAssistApi.Models;

namespace LearningAssistApi.Services
{
    public interface IUserService
    {
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        Task<UserProfileDto> UpdateUserProfileAsync(string userId, UpdateUserProfileDto updateDto);
        Task<UserPreferencesDto> GetUserPreferencesAsync(string userId);
        Task<UserPreferencesDto> UpdateUserPreferencesAsync(string userId, UpdateUserPreferencesDto updateDto);
        Task<bool> DeleteUserAccountAsync(string userId, DeleteAccountDto deleteDto);
        Task<UserBasicInfoDto> GetUserBasicInfoAsync(string userId);
        Task<List<UserBasicInfoDto>> GetUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null);
        Task<bool> UpdateProfilePictureAsync(string userId, string profilePictureUrl);
        Task<bool> DeactivateUserAsync(string userId);
        Task<bool> ReactivateUserAsync(string userId);
        Task<User?> GetUserByIdAsync(string userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email, string? excludeUserId = null);
    }
}
