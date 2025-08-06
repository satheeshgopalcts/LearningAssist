using LearningAssistApi.DTOs;
using LearningAssistApi.Models;
using LearningAssistApi.Repositories;
using LiteDB;

namespace LearningAssistApi.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return MapToUserProfileDto(user);
        }

        public async Task<UserProfileDto> UpdateUserProfileAsync(string userId, UpdateUserProfileDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateDto.FirstName))
                user.FirstName = updateDto.FirstName;
            
            if (!string.IsNullOrEmpty(updateDto.LastName))
                user.LastName = updateDto.LastName;
            
            if (updateDto.PhoneNumber != null)
                user.PhoneNumber = updateDto.PhoneNumber;
            
            if (updateDto.DateOfBirth.HasValue)
                user.DateOfBirth = updateDto.DateOfBirth.Value;
            
            if (updateDto.Biography != null)
                user.Biography = updateDto.Biography;
            
            if (!string.IsNullOrEmpty(updateDto.ProfilePictureUrl))
                user.ProfilePictureUrl = updateDto.ProfilePictureUrl;
            
            if (updateDto.PreferredLearningStyle.HasValue)
                user.PreferredLearningStyle = updateDto.PreferredLearningStyle.Value;
            
            if (updateDto.CareerGoals != null)
                user.CareerGoals = updateDto.CareerGoals;
            
            if (updateDto.Skills != null)
                user.Skills = updateDto.Skills;
            
            if (updateDto.Interests != null)
                user.Interests = updateDto.Interests;
            
            if (updateDto.PreferredDifficulty.HasValue)
                user.PreferredDifficulty = updateDto.PreferredDifficulty.Value;
            
            if (updateDto.PreferredStudyTime.HasValue)
                user.PreferredStudyTime = updateDto.PreferredStudyTime.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User profile updated for user {UserId}", userId);

            return MapToUserProfileDto(user);
        }

        public async Task<UserPreferencesDto> GetUserPreferencesAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return new UserPreferencesDto
            {
                PreferredLearningStyle = user.PreferredLearningStyle,
                CareerGoals = user.CareerGoals,
                Skills = user.Skills,
                Interests = user.Interests,
                PreferredDifficulty = user.PreferredDifficulty,
                PreferredStudyTime = user.PreferredStudyTime
            };
        }

        public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(string userId, UpdateUserPreferencesDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Update only provided fields
            if (updateDto.PreferredLearningStyle.HasValue)
                user.PreferredLearningStyle = updateDto.PreferredLearningStyle.Value;
            
            if (updateDto.CareerGoals != null)
                user.CareerGoals = updateDto.CareerGoals;
            
            if (updateDto.Skills != null)
                user.Skills = updateDto.Skills;
            
            if (updateDto.Interests != null)
                user.Interests = updateDto.Interests;
            
            if (updateDto.PreferredDifficulty.HasValue)
                user.PreferredDifficulty = updateDto.PreferredDifficulty.Value;
            
            if (updateDto.PreferredStudyTime.HasValue)
                user.PreferredStudyTime = updateDto.PreferredStudyTime.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User preferences updated for user {UserId}", userId);

            return new UserPreferencesDto
            {
                PreferredLearningStyle = user.PreferredLearningStyle,
                CareerGoals = user.CareerGoals,
                Skills = user.Skills,
                Interests = user.Interests,
                PreferredDifficulty = user.PreferredDifficulty,
                PreferredStudyTime = user.PreferredStudyTime
            };
        }

        public async Task<bool> DeleteUserAccountAsync(string userId, DeleteAccountDto deleteDto)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            if (!deleteDto.ConfirmDeletion)
            {
                throw new InvalidOperationException("Account deletion must be confirmed");
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(deleteDto.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid current password");
            }

            // Instead of hard delete, we'll deactivate and mark for deletion
            user.IsActive = false;
            user.Email = $"deleted_{DateTime.UtcNow.Ticks}_{user.Email}";
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User account deleted for user {UserId}. Reason: {Reason}", 
                userId, deleteDto.Reason ?? "No reason provided");

            return true;
        }

        public async Task<UserBasicInfoDto> GetUserBasicInfoAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return new UserBasicInfoDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                LastLoginAt = user.LastLoginAt
            };
        }

        public async Task<List<UserBasicInfoDto>> GetUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null)
        {
            var users = await _userRepository.GetPagedAsync(page, pageSize, searchTerm);
            
            return users.Select(user => new UserBasicInfoDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                LastLoginAt = user.LastLoginAt
            }).ToList();
        }

        public async Task<bool> UpdateProfilePictureAsync(string userId, string profilePictureUrl)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            user.ProfilePictureUrl = profilePictureUrl;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Profile picture updated for user {UserId}", userId);

            return true;
        }

        public async Task<bool> DeactivateUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User deactivated: {UserId}", userId);

            return true;
        }

        public async Task<bool> ReactivateUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(new ObjectId(userId));
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User reactivated: {UserId}", userId);

            return true;
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _userRepository.GetByIdAsync(new ObjectId(userId));
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetByEmailAsync(email);
        }

        public async Task<bool> IsEmailUniqueAsync(string email, string? excludeUserId = null)
        {
            var existingUser = await _userRepository.GetByEmailAsync(email);
            
            if (existingUser == null)
                return true;
            
            if (!string.IsNullOrEmpty(excludeUserId) && existingUser.Id.ToString() == excludeUserId)
                return true;
            
            return false;
        }

        private static UserProfileDto MapToUserProfileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Biography = user.Biography,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                LastLoginAt = user.LastLoginAt,
                PreferredLearningStyle = user.PreferredLearningStyle,
                CareerGoals = user.CareerGoals,
                Skills = user.Skills,
                Interests = user.Interests,
                PreferredDifficulty = user.PreferredDifficulty,
                PreferredStudyTime = user.PreferredStudyTime,
                HasGoogleAccount = !string.IsNullOrEmpty(user.GoogleId),
                HasLinkedInAccount = !string.IsNullOrEmpty(user.LinkedInId)
            };
        }
    }
}
