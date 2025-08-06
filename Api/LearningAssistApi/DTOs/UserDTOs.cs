using System.ComponentModel.DataAnnotations;
using LearningAssistApi.Models;

namespace LearningAssistApi.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Biography { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public UserRole Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        
        // Learning Preferences
        public LearningStyle PreferredLearningStyle { get; set; }
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<string> Interests { get; set; } = new();
        public DifficultyLevel PreferredDifficulty { get; set; }
        public StudyTime PreferredStudyTime { get; set; }
        
        // Social Login Status
        public bool HasGoogleAccount { get; set; }
        public bool HasLinkedInAccount { get; set; }
    }

    public class UpdateUserProfileDto
    {
        [StringLength(100, MinimumLength = 2)]
        public string? FirstName { get; set; }

        [StringLength(100, MinimumLength = 2)]
        public string? LastName { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [StringLength(1000)]
        public string? Biography { get; set; }

        [Url]
        public string? ProfilePictureUrl { get; set; }

        // Learning Preferences
        public LearningStyle? PreferredLearningStyle { get; set; }
        
        public List<string>? CareerGoals { get; set; }
        
        public List<string>? Skills { get; set; }
        
        public List<string>? Interests { get; set; }
        
        public DifficultyLevel? PreferredDifficulty { get; set; }
        
        public StudyTime? PreferredStudyTime { get; set; }
    }

    public class UserBasicInfoDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}";
        public string? ProfilePictureUrl { get; set; }
        public UserRole Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class DeleteAccountDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        
        [Required]
        public bool ConfirmDeletion { get; set; } = false;
        
        public string? Reason { get; set; }
    }

    public class UserPreferencesDto
    {
        public LearningStyle PreferredLearningStyle { get; set; }
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<string> Interests { get; set; } = new();
        public DifficultyLevel PreferredDifficulty { get; set; }
        public StudyTime PreferredStudyTime { get; set; }
    }

    public class UpdateUserPreferencesDto
    {
        public LearningStyle? PreferredLearningStyle { get; set; }
        public List<string>? CareerGoals { get; set; }
        public List<string>? Skills { get; set; }
        public List<string>? Interests { get; set; }
        public DifficultyLevel? PreferredDifficulty { get; set; }
        public StudyTime? PreferredStudyTime { get; set; }
    }
}
