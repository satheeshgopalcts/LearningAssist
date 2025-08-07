using System.ComponentModel.DataAnnotations;
using LearningAssistApi.Models;

namespace LearningAssistApi.DTOs
{
    // Learning Path DTOs
    public class LearningPathDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public LearningPathType Type { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public List<LearningPathCourseDto> Courses { get; set; } = new();
        public LearningPathMetadataDto Metadata { get; set; } = new();
        public LearningPathStatisticsDto Statistics { get; set; } = new();
        public int EstimatedDurationDays { get; set; }
        public int EstimatedHours { get; set; }
        public bool IsPublic { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Version { get; set; }
        
        // User-specific information
        public bool IsEnrolled { get; set; } = false;
        public LearningPathProgressDto? Progress { get; set; }
    }

    public class LearningPathListDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public LearningPathType Type { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public int CourseCount { get; set; }
        public int TotalCourses { get; set; }
        public int EstimatedDurationDays { get; set; }
        public int EstimatedHours { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int TotalEnrollments { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsEnrolled { get; set; } = false;
        public double ProgressPercentage { get; set; } = 0.0;
    }

    public class CreateLearningPathDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [StringLength(500)]
        public string ShortDescription { get; set; } = string.Empty;

        public LearningPathType Type { get; set; } = LearningPathType.Custom;
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Beginner;

        [Url]
        public string? ThumbnailUrl { get; set; }

        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> CareerGoals { get; set; } = new();
        public List<string> Skills { get; set; } = new();

        [Required]
        [MinLength(1, ErrorMessage = "At least one course is required")]
        public List<string> CourseIds { get; set; } = new();

        public CreateLearningPathMetadataDto Metadata { get; set; } = new();

        public int EstimatedDurationDays { get; set; }
        public int EstimatedHours { get; set; }
        public bool IsPublic { get; set; } = true;
    }

    public class UpdateLearningPathDto
    {
        [StringLength(200, MinimumLength = 2)]
        public string? Title { get; set; }

        [StringLength(2000, MinimumLength = 10)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        public LearningPathType? Type { get; set; }
        public DifficultyLevel? Difficulty { get; set; }

        [Url]
        public string? ThumbnailUrl { get; set; }

        public List<string>? Tags { get; set; }
        public List<string>? Categories { get; set; }
        public List<string>? CareerGoals { get; set; }
        public List<string>? Skills { get; set; }

        public List<string>? CourseIds { get; set; }
        public UpdateLearningPathMetadataDto? Metadata { get; set; }

        public int? EstimatedDurationDays { get; set; }
        public int? EstimatedHours { get; set; }
        public bool? IsPublic { get; set; }
        public bool? IsActive { get; set; }
    }

    // Learning Path Course DTOs
    public class LearningPathCourseDto
    {
        public string CourseId { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public bool IsUnlocked { get; set; }
        public List<string> Prerequisites { get; set; } = new();
        public int EstimatedDurationMinutes { get; set; }
        public DateTime AddedAt { get; set; }
        
        // Course summary information
        public string? ThumbnailUrl { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public double AverageRating { get; set; }
        public int TotalEnrollments { get; set; }
        
        // User progress information
        public bool IsEnrolled { get; set; } = false;
        public bool IsCompleted { get; set; } = false;
        public double ProgressPercentage { get; set; } = 0.0;
    }

    public class CreateLearningPathCourseDto
    {
        [Required]
        public string CourseId { get; set; } = string.Empty;

        public int OrderIndex { get; set; } = 0;
        public bool IsRequired { get; set; } = true;
        public bool IsUnlocked { get; set; } = true;
        public List<string> Prerequisites { get; set; } = new();
    }

    public class UpdateLearningPathCourseDto
    {
        [Required]
        public string CourseId { get; set; } = string.Empty;

        public int? OrderIndex { get; set; }
        public bool? IsRequired { get; set; }
        public bool? IsUnlocked { get; set; }
        public List<string>? Prerequisites { get; set; }
    }

    // Learning Path Metadata DTOs
    public class LearningPathMetadataDto
    {
        public List<string> TargetAudience { get; set; } = new();
        public List<string> LearningObjectives { get; set; } = new();
        public List<string> Prerequisites { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; }
        public int ContinuousEducationUnits { get; set; }
    }

    public class CreateLearningPathMetadataDto
    {
        public List<string> TargetAudience { get; set; } = new();
        public List<string> LearningObjectives { get; set; } = new();
        public List<string> Prerequisites { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; } = false;
        public int ContinuousEducationUnits { get; set; } = 0;
    }

    public class UpdateLearningPathMetadataDto
    {
        public List<string>? TargetAudience { get; set; }
        public List<string>? LearningObjectives { get; set; }
        public List<string>? Prerequisites { get; set; }
        public string? CertificateTemplate { get; set; }
        public bool? HasCertificate { get; set; }
        public int? ContinuousEducationUnits { get; set; }
    }

    public class LearningPathStatisticsDto
    {
        public int TotalEnrollments { get; set; }
        public int ActiveEnrollments { get; set; }
        public int CompletedEnrollments { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public double CompletionRate { get; set; }
        public int AverageCompletionDays { get; set; }
        public DateTime? LastEnrollmentDate { get; set; }
        public DateTime? LastCompletionDate { get; set; }
    }

    // Learning Path Progress DTOs
    public class LearningPathProgressDto
    {
        public string LearningPathId { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public double ProgressPercentage { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalCourses { get; set; }
        public int TotalTimeSpentMinutes { get; set; }
        public List<LearningPathCourseProgressDto> CourseProgress { get; set; } = new();
    }

    public class LearningPathCourseProgressDto
    {
        public string CourseId { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public bool IsUnlocked { get; set; }
        public bool IsEnrolled { get; set; }
        public bool IsCompleted { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? LastAccessedAt { get; set; }
    }

    // Learning Path Filtering and Searching
    public class LearningPathFilterDto
    {
        public string? Search { get; set; }
        public List<string>? Categories { get; set; }
        public List<string>? Tags { get; set; }
        public List<string>? CareerGoals { get; set; }
        public List<string>? Skills { get; set; }
        public LearningPathType? Type { get; set; }
        public DifficultyLevel? Difficulty { get; set; }
        public bool? HasCertificate { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsPublic { get; set; }
        public string? CreatedBy { get; set; }
        public int? MinDuration { get; set; }
        public int? MaxDuration { get; set; }
        public double? MinRating { get; set; }
        public string? SortBy { get; set; } = "CreatedAt"; // CreatedAt, Title, Rating, Popularity, Duration
        public string? SortOrder { get; set; } = "desc"; // asc, desc
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    // Enrollment DTOs
    public class EnrollInCourseDto
    {
        [Required]
        public string CourseId { get; set; } = string.Empty;
        
        public string? LearningPathId { get; set; }
        public string EnrollmentSource { get; set; } = "Direct";
    }

    public class EnrollInLearningPathDto
    {
        [Required]
        public string LearningPathId { get; set; } = string.Empty;
    }



    // Bulk operations
    public class BulkEnrollmentDto
    {
        [Required]
        [MinLength(1)]
        public List<string> UserIds { get; set; } = new();
        
        [Required]
        public string CourseId { get; set; } = string.Empty;
        
        public string? LearningPathId { get; set; }
        public string EnrollmentSource { get; set; } = "Bulk";
    }

    public class BulkEnrollmentResultDto
    {
        public int TotalUsers { get; set; }
        public int SuccessfulEnrollments { get; set; }
        public int FailedEnrollments { get; set; }
        public List<EnrollmentErrorDto> Errors { get; set; } = new();
    }

    public class EnrollmentErrorDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
    }

    public class LearningPathEnrollmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string LearningPathId { get; set; } = string.Empty;
        public string LearningPathTitle { get; set; } = string.Empty;
        public EnrollmentStatus Status { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public LearningPathProgressDto Progress { get; set; } = new();
        public List<LearningPathCourseProgressDto> CourseProgress { get; set; } = new();
        public int TotalTimeSpentMinutes { get; set; }
        public double OverallScore { get; set; }
        public bool HasCertificate { get; set; }
        public string? CertificateUrl { get; set; }
    }



    public class RateLearningPathDto
    {
        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [StringLength(1000)]
        public string? Review { get; set; }

        public bool IsPublic { get; set; } = true;
        
        public List<string> Tags { get; set; } = new();
    }
}
