using LiteDB;
using System.ComponentModel.DataAnnotations;

namespace LearningAssistApi.Models
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        
        public DateTime DateOfBirth { get; set; }
        
        public string? Biography { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public UserRole Role { get; set; } = UserRole.Student;
        
        public bool IsEmailVerified { get; set; } = false;
        
        public string? EmailVerificationToken { get; set; }
        
        public DateTime? EmailVerificationTokenExpiry { get; set; }
        
        public string? PasswordResetToken { get; set; }
        
        public DateTime? PasswordResetTokenExpiry { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastLoginAt { get; set; }
        
        public int LoginAttempts { get; set; } = 0;
        
        public DateTime? LockedUntil { get; set; }
        
        // Learning Preferences
        public LearningStyle PreferredLearningStyle { get; set; } = LearningStyle.Visual;
        
        public List<string> CareerGoals { get; set; } = new();
        
        public List<string> Skills { get; set; } = new();
        
        public List<string> Interests { get; set; } = new();
        
        public DifficultyLevel PreferredDifficulty { get; set; } = DifficultyLevel.Beginner;
        
        public StudyTime PreferredStudyTime { get; set; } = StudyTime.Evening;
        
        // Social Login
        public string? GoogleId { get; set; }
        
        public string? LinkedInId { get; set; }
        
        public List<string> RefreshTokens { get; set; } = new();
    }

    public enum UserRole
    {
        Student,
        Instructor,
        Administrator
    }

    public enum LearningStyle
    {
        Visual,
        Auditory,
        Kinesthetic,
        ReadingWriting
    }

    public enum DifficultyLevel
    {
        Beginner,
        Intermediate,
        Advanced,
        Expert
    }

    public enum StudyTime
    {
        Morning,
        Afternoon,
        Evening,
        Night,
        Weekend
    }
}
