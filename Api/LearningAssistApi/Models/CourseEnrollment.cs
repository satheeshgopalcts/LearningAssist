using LiteDB;
using System.ComponentModel.DataAnnotations;

namespace LearningAssistApi.Models
{
    public class CourseEnrollment
    {
        [BsonId]
        public ObjectId Id { get; set; } = ObjectId.Empty;
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public string CourseId { get; set; } = string.Empty;
        
        public string UserName { get; set; } = string.Empty;
        
        public string CourseTitle { get; set; } = string.Empty;
        
        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
        
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public DateTime? CertificateIssuedAt { get; set; }
        
        public DateTime LastAccessedAt { get; set; } = DateTime.UtcNow;
        
        public EnrollmentProgress Progress { get; set; } = new();
        
        public List<ModuleProgress> ModuleProgress { get; set; } = new();
        
        public List<AssessmentAttempt> AssessmentAttempts { get; set; } = new();
        
        public CourseRating? Rating { get; set; }
        
        public int TotalTimeSpentMinutes { get; set; } = 0;
        
        public double OverallScore { get; set; } = 0.0;
        
        public bool HasCertificate { get; set; } = false;
        
        public string? CertificateUrl { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public string EnrollmentSource { get; set; } = "Direct"; // Direct, LearningPath, Assignment
        
        public string? LearningPathId { get; set; }
    }

    public class EnrollmentProgress
    {
        public int TotalModules { get; set; } = 0;
        public int CompletedModules { get; set; } = 0;
        public int TotalLessons { get; set; } = 0;
        public int CompletedLessons { get; set; } = 0;
        public int TotalAssessments { get; set; } = 0;
        public int PassedAssessments { get; set; } = 0;
        public double ProgressPercentage { get; set; } = 0.0;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class ModuleProgress
    {
        public string ModuleId { get; set; } = string.Empty;
        public string ModuleTitle { get; set; } = string.Empty;
        public ModuleStatus Status { get; set; } = ModuleStatus.NotStarted;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TimeSpentMinutes { get; set; } = 0;
        public List<LessonProgress> LessonProgress { get; set; } = new();
        public List<AssessmentProgress> AssessmentProgress { get; set; } = new();
        public double ProgressPercentage { get; set; } = 0.0;
    }

    public class LessonProgress
    {
        public string LessonId { get; set; } = string.Empty;
        public string LessonTitle { get; set; } = string.Empty;
        public LessonStatus Status { get; set; } = LessonStatus.NotStarted;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TimeSpentMinutes { get; set; } = 0;
        public int ProgressPercentage { get; set; } = 0;
    }

    public class AssessmentProgress
    {
        public string AssessmentId { get; set; } = string.Empty;
        public string AssessmentTitle { get; set; } = string.Empty;
        public AssessmentStatus Status { get; set; } = AssessmentStatus.NotStarted;
        public int AttemptCount { get; set; } = 0;
        public double? BestScore { get; set; }
        public double? LatestScore { get; set; }
        public bool HasPassed { get; set; } = false;
        public DateTime? LastAttemptAt { get; set; }
    }

    public class AssessmentAttempt
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string AssessmentId { get; set; } = string.Empty;
        public string AssessmentTitle { get; set; } = string.Empty;
        public int AttemptNumber { get; set; } = 1;
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public int TimeSpentMinutes { get; set; } = 0;
        public double Score { get; set; } = 0.0;
        public double MaxScore { get; set; } = 0.0;
        public double Percentage { get; set; } = 0.0;
        public bool HasPassed { get; set; } = false;
        public List<QuestionAnswer> Answers { get; set; } = new();
        public string? Feedback { get; set; }
        public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    }

    public class QuestionAnswer
    {
        public string QuestionId { get; set; } = string.Empty;
        public List<string> SelectedAnswers { get; set; } = new(); // Answer option IDs
        public string? TextAnswer { get; set; } // For text-based questions
        public bool IsCorrect { get; set; } = false;
        public double Points { get; set; } = 0.0;
        public string? Feedback { get; set; }
    }

    public class CourseRating
    {
        public int Rating { get; set; } = 5; // 1-5 stars
        public string? Review { get; set; }
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
        public bool IsPublic { get; set; } = true;
        public List<string> Tags { get; set; } = new(); // helpful, clear, engaging, etc.
    }

    public enum EnrollmentStatus
    {
        Active,
        Completed,
        Dropped,
        Suspended,
        Expired
    }

    public enum ModuleStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Locked
    }

    public enum LessonStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Skipped,
        Locked
    }

    public enum AssessmentStatus
    {
        NotStarted,
        InProgress,
        Passed,
        Failed,
        Skipped,
        Locked
    }

    public enum AttemptStatus
    {
        InProgress,
        Submitted,
        TimedOut,
        Cancelled
    }
}
