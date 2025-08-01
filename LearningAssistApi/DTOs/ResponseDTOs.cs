using LearningAssistApi.Models;

namespace LearningAssistApi.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = new();
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Biography { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public UserRole Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public LearningStyle PreferredLearningStyle { get; set; }
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<string> Interests { get; set; } = new();
        public DifficultyLevel PreferredDifficulty { get; set; }
        public StudyTime PreferredStudyTime { get; set; }
    }

    public class UpdateProfileDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(100, MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Phone]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Biography { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public LearningStyle PreferredLearningStyle { get; set; }

        public List<string> CareerGoals { get; set; } = new();

        public List<string> Skills { get; set; } = new();

        public List<string> Interests { get; set; } = new();

        public DifficultyLevel PreferredDifficulty { get; set; }

        public StudyTime PreferredStudyTime { get; set; }
    }

    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
