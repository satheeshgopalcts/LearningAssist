using LiteDB;
using System.ComponentModel.DataAnnotations;

namespace LearningAssistApi.Models
{
    public class LearningPath
    {
        [BsonId]
        public ObjectId Id { get; set; } = ObjectId.Empty;
        
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string ShortDescription { get; set; } = string.Empty;
        
        public string CreatedBy { get; set; } = string.Empty; // User ID
        
        public string CreatedByName { get; set; } = string.Empty;
        
        public LearningPathType Type { get; set; } = LearningPathType.Custom;
        
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Beginner;
        
        public string? ThumbnailUrl { get; set; }
        
        public List<string> Tags { get; set; } = new();
        
        public List<string> Categories { get; set; } = new();
        
        public List<string> CareerGoals { get; set; } = new();
        
        public List<string> Skills { get; set; } = new();
        
        public List<LearningPathCourse> Courses { get; set; } = new();
        
        public LearningPathMetadata Metadata { get; set; } = new();
        
        public LearningPathStatistics Statistics { get; set; } = new();
        
        public int EstimatedDurationDays { get; set; } = 0;
        
        public int EstimatedHours { get; set; } = 0;
        
        public bool IsPublic { get; set; } = true;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsFeatured { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string UpdatedBy { get; set; } = string.Empty;
        
        public int Version { get; set; } = 1;
    }

    public class LearningPathCourse
    {
        public string CourseId { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public bool IsRequired { get; set; } = true;
        public bool IsUnlocked { get; set; } = true;
        public List<string> Prerequisites { get; set; } = new(); // Course IDs that must be completed first
        public int EstimatedDurationMinutes { get; set; } = 0;
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }

    public class LearningPathMetadata
    {
        public List<string> TargetAudience { get; set; } = new();
        public List<string> LearningObjectives { get; set; } = new();
        public List<string> Prerequisites { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; } = false;
        public int ContinuousEducationUnits { get; set; } = 0;
    }

    public class LearningPathStatistics
    {
        public int TotalEnrollments { get; set; } = 0;
        public int ActiveEnrollments { get; set; } = 0;
        public int CompletedEnrollments { get; set; } = 0;
        public double AverageRating { get; set; } = 0.0;
        public int TotalRatings { get; set; } = 0;
        public double CompletionRate { get; set; } = 0.0;
        public int AverageCompletionDays { get; set; } = 0;
        public DateTime? LastEnrollmentDate { get; set; }
        public DateTime? LastCompletionDate { get; set; }
    }

    public enum LearningPathType
    {
        Custom,
        Curated,
        CareerTrack,
        SkillBased,
        Certification,
        Bootcamp
    }
}
