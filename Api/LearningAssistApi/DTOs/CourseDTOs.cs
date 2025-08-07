using System.ComponentModel.DataAnnotations;
using LearningAssistApi.Models;

namespace LearningAssistApi.DTOs
{
    // Course DTOs
    public class CourseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string InstructorId { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public CourseStatus Status { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? PreviewVideoUrl { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> Prerequisites { get; set; } = new();
        public List<string> LearningObjectives { get; set; } = new();
        public CourseMetadataDto Metadata { get; set; } = new();
        public CourseSettingsDto Settings { get; set; } = new();
        public CourseStatisticsDto Statistics { get; set; } = new();
        public int EstimatedDurationMinutes { get; set; }
        public int MaxEnrollments { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public int Version { get; set; }
        
        // Navigation properties
        public List<CourseModuleDto> Modules { get; set; } = new();
        public UserProgressDto? UserProgress { get; set; } // Only populated when user is authenticated
        public bool IsEnrolled { get; set; } = false;
    }

    public class CourseListDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public DifficultyLevel Difficulty { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public int EstimatedDurationMinutes { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int TotalEnrollments { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsEnrolled { get; set; } = false;
    }

    public class CreateCourseDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [StringLength(500)]
        public string ShortDescription { get; set; } = string.Empty;

        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Beginner;

        [Range(0, 10000)]
        public decimal Price { get; set; } = 0m;

        public string Currency { get; set; } = "USD";

        [Url]
        public string? ThumbnailUrl { get; set; }

        [Url]
        public string? PreviewVideoUrl { get; set; }

        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> Prerequisites { get; set; } = new();
        public List<string> LearningObjectives { get; set; } = new();

        public CreateCourseMetadataDto Metadata { get; set; } = new();
        public CreateCourseSettingsDto Settings { get; set; } = new();

        public int EstimatedDurationMinutes { get; set; } = 0;
        public int MaxEnrollments { get; set; } = 0;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class UpdateCourseDto
    {
        [StringLength(200, MinimumLength = 2)]
        public string? Title { get; set; }

        [StringLength(2000, MinimumLength = 10)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        public DifficultyLevel? Difficulty { get; set; }

        [Range(0, 10000)]
        public decimal? Price { get; set; }

        public string? Currency { get; set; }

        [Url]
        public string? ThumbnailUrl { get; set; }

        [Url]
        public string? PreviewVideoUrl { get; set; }

        public List<string>? Tags { get; set; }
        public List<string>? Categories { get; set; }
        public List<string>? Prerequisites { get; set; }
        public List<string>? LearningObjectives { get; set; }

        public UpdateCourseMetadataDto? Metadata { get; set; }
        public UpdateCourseSettingsDto? Settings { get; set; }

        public int? EstimatedDurationMinutes { get; set; }
        public int? MaxEnrollments { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public CourseStatus? Status { get; set; }
    }

    // Course Module DTOs
    public class CourseModuleDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public int EstimatedDurationMinutes { get; set; }
        public bool IsRequired { get; set; }
        public List<LessonDto> Lessons { get; set; } = new();
        public List<AssessmentDto> Assessments { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Progress information (when authenticated)
        public ModuleProgressDto? Progress { get; set; }
    }

    public class CreateCourseModuleDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        public int OrderIndex { get; set; } = 0;
        public int EstimatedDurationMinutes { get; set; } = 0;
        public bool IsRequired { get; set; } = true;
    }

    // Lesson DTOs
    public class LessonDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public LessonType Type { get; set; }
        public int OrderIndex { get; set; }
        public int EstimatedDurationMinutes { get; set; }
        public bool IsRequired { get; set; }
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }
        public List<string> ResourceUrls { get; set; } = new();
        public List<string> AttachmentUrls { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Progress information (when authenticated)
        public LessonProgressDto? Progress { get; set; }
    }

    public class CreateLessonDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public LessonType Type { get; set; } = LessonType.Text;
        public int OrderIndex { get; set; } = 0;
        public int EstimatedDurationMinutes { get; set; } = 0;
        public bool IsRequired { get; set; } = true;

        [Url]
        public string? VideoUrl { get; set; }

        [Url]
        public string? AudioUrl { get; set; }

        public List<string> ResourceUrls { get; set; } = new();
        public List<string> AttachmentUrls { get; set; } = new();
    }

    // Assessment DTOs
    public class AssessmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public AssessmentType Type { get; set; }
        public int OrderIndex { get; set; }
        public int TimeLimit { get; set; }
        public int MaxAttempts { get; set; }
        public int PassingScore { get; set; }
        public bool IsRequired { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Progress information (when authenticated)
        public AssessmentProgressDto? Progress { get; set; }
    }

    public class CreateAssessmentDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        public AssessmentType Type { get; set; } = AssessmentType.Quiz;
        public int OrderIndex { get; set; } = 0;
        public int TimeLimit { get; set; } = 0;
        public int MaxAttempts { get; set; } = 3;

        [Range(1, 100)]
        public int PassingScore { get; set; } = 70;

        public bool IsRequired { get; set; } = true;
    }

    // Supporting DTOs
    public class CourseMetadataDto
    {
        public string Language { get; set; } = "en";
        public List<string> Subtitles { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; } = false;
        public int ContinuousEducationUnits { get; set; } = 0;
        public List<string> TargetAudience { get; set; } = new();
        public List<string> Topics { get; set; } = new();
    }

    public class CreateCourseMetadataDto
    {
        public string Language { get; set; } = "en";
        public List<string> Subtitles { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; } = false;
        public int ContinuousEducationUnits { get; set; } = 0;
        public List<string> TargetAudience { get; set; } = new();
        public List<string> Topics { get; set; } = new();
    }

    public class UpdateCourseMetadataDto
    {
        public string? Language { get; set; }
        public List<string>? Subtitles { get; set; }
        public string? CertificateTemplate { get; set; }
        public bool? HasCertificate { get; set; }
        public int? ContinuousEducationUnits { get; set; }
        public List<string>? TargetAudience { get; set; }
        public List<string>? Topics { get; set; }
    }

    public class CourseSettingsDto
    {
        public bool AllowDiscussions { get; set; } = true;
        public bool AllowDownloads { get; set; } = false;
        public bool RequireSequentialProgress { get; set; } = true;
        public bool AllowSkipping { get; set; } = false;
        public bool ShowProgress { get; set; } = true;
        public bool AllowReAttempts { get; set; } = true;
        public int DaysToComplete { get; set; } = 0;
        public bool IsPublic { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
    }

    public class CreateCourseSettingsDto
    {
        public bool AllowDiscussions { get; set; } = true;
        public bool AllowDownloads { get; set; } = false;
        public bool RequireSequentialProgress { get; set; } = true;
        public bool AllowSkipping { get; set; } = false;
        public bool ShowProgress { get; set; } = true;
        public bool AllowReAttempts { get; set; } = true;
        public int DaysToComplete { get; set; } = 0;
        public bool IsPublic { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
    }

    public class UpdateCourseSettingsDto
    {
        public bool? AllowDiscussions { get; set; }
        public bool? AllowDownloads { get; set; }
        public bool? RequireSequentialProgress { get; set; }
        public bool? AllowSkipping { get; set; }
        public bool? ShowProgress { get; set; }
        public bool? AllowReAttempts { get; set; }
        public int? DaysToComplete { get; set; }
        public bool? IsPublic { get; set; }
        public bool? RequireApproval { get; set; }
    }

    public class CourseStatisticsDto
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

    // Course Filtering and Searching
    public class CourseFilterDto
    {
        public string? Search { get; set; }
        public List<string>? Categories { get; set; }
        public List<string>? Tags { get; set; }
        public DifficultyLevel? Difficulty { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? HasCertificate { get; set; }
        public bool? IsFree { get; set; }
        public bool? IsFeatured { get; set; }
        public CourseStatus? Status { get; set; }
        public string? InstructorId { get; set; }
        public int? MinDuration { get; set; }
        public int? MaxDuration { get; set; }
        public double? MinRating { get; set; }
        public string? SortBy { get; set; } = "CreatedAt"; // CreatedAt, Title, Rating, Price, Popularity
        public string? SortOrder { get; set; } = "desc"; // asc, desc
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    // Progress DTOs (these would be used when user is authenticated)
    public class UserProgressDto
    {
        public double OverallProgress { get; set; }
        public int CompletedModules { get; set; }
        public int TotalModules { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public int TimeSpentMinutes { get; set; }
        public DateTime LastAccessedAt { get; set; }
    }

    public class ModuleProgressDto
    {
        public string ModuleId { get; set; } = string.Empty;
        public string ModuleTitle { get; set; } = string.Empty;
        public ModuleStatus Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TimeSpentMinutes { get; set; }
        public double ProgressPercentage { get; set; }
        public List<LessonProgressDto> LessonProgress { get; set; } = new();
    }

    public class LessonProgressDto
    {
        public string LessonId { get; set; } = string.Empty;
        public string LessonTitle { get; set; } = string.Empty;
        public LessonStatus Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TimeSpentMinutes { get; set; }
        public int ProgressPercentage { get; set; }
    }

    public class AssessmentProgressDto
    {
        public AssessmentStatus Status { get; set; }
        public int AttemptCount { get; set; }
        public double? BestScore { get; set; }
        public double? LatestScore { get; set; }
        public bool HasPassed { get; set; }
        public DateTime? LastAttemptAt { get; set; }
    }

    public class QuestionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int OrderIndex { get; set; }
        public List<AnswerOptionDto> Options { get; set; } = new();
        public string? Explanation { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class AnswerOptionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        // Note: IsCorrect is not included in public DTO for security
    }
    
    // Course Enrollment DTOs
    public class CourseEnrollmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public EnrollmentStatus Status { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CertificateIssuedAt { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public EnrollmentProgressDto Progress { get; set; } = new();
        public List<ModuleProgressDto> ModuleProgress { get; set; } = new();
        public CourseRatingDto? Rating { get; set; }
        public int TotalTimeSpentMinutes { get; set; }
        public double OverallScore { get; set; }
        public bool HasCertificate { get; set; }
        public string? CertificateUrl { get; set; }
        public string EnrollmentSource { get; set; } = string.Empty;
        public string? LearningPathId { get; set; }
    }

    public class EnrollmentProgressDto
    {
        public int TotalModules { get; set; }
        public int CompletedModules { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalAssessments { get; set; }
        public int PassedAssessments { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class UpdateProgressDto
    {
        public string ModuleId { get; set; } = string.Empty;
        public string? LessonId { get; set; }
        public ModuleStatus ModuleStatus { get; set; }
        public LessonStatus? LessonStatus { get; set; }
        public int TimeSpentMinutes { get; set; } = 0;
        public int ProgressPercentage { get; set; } = 0;
    }

    public class CourseRatingDto
    {
        public int Rating { get; set; } = 5;
        public string? Review { get; set; }
        public DateTime RatedAt { get; set; }
        public bool IsPublic { get; set; } = true;
        public List<string> Tags { get; set; } = new();
    }

    public class RateCourseDto
    {
        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [StringLength(1000)]
        public string? Review { get; set; }

        public bool IsPublic { get; set; } = true;
        
        public List<string> Tags { get; set; } = new();
    }

    // Assessment Attempt DTOs
    public class AssessmentAttemptDto
    {
        public string Id { get; set; } = string.Empty;
        public string AssessmentId { get; set; } = string.Empty;
        public string AssessmentTitle { get; set; } = string.Empty;
        public int AttemptNumber { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int TimeSpentMinutes { get; set; }
        public double Score { get; set; }
        public double MaxScore { get; set; }
        public double Percentage { get; set; }
        public bool HasPassed { get; set; }
        public string? Feedback { get; set; }
        public AttemptStatus Status { get; set; }
    }

    public class SubmitAssessmentDto
    {
        [Required]
        public string AssessmentId { get; set; } = string.Empty;
        
        [Required]
        public List<QuestionAnswerDto> Answers { get; set; } = new();
        
        public int TimeSpentMinutes { get; set; } = 0;
    }

    public class QuestionAnswerDto
    {
        [Required]
        public string QuestionId { get; set; } = string.Empty;
        
        public List<string> SelectedAnswers { get; set; } = new();
        
        public string? TextAnswer { get; set; }
    }
}
