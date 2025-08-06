using LiteDB;
using System.ComponentModel.DataAnnotations;

namespace LearningAssistApi.Models
{
    public class Course
    {
        [BsonId]
        public ObjectId Id { get; set; } = ObjectId.Empty;
        
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string ShortDescription { get; set; } = string.Empty;
        
        [Required]
        public string InstructorId { get; set; } = string.Empty;
        
        public string InstructorName { get; set; } = string.Empty;
        
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
        
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Beginner;
        
        public decimal Price { get; set; } = 0m;
        
        public string Currency { get; set; } = "USD";
        
        public string? ThumbnailUrl { get; set; }
        
        public string? PreviewVideoUrl { get; set; }
        
        public List<string> Tags { get; set; } = new();
        
        public List<string> Categories { get; set; } = new();
        
        public List<string> Prerequisites { get; set; } = new();
        
        public List<string> LearningObjectives { get; set; } = new();
        
        public List<CourseModule> Modules { get; set; } = new();
        
        public CourseMetadata Metadata { get; set; } = new();
        
        public CourseSettings Settings { get; set; } = new();
        
        public CourseStatistics Statistics { get; set; } = new();
        
        public int EstimatedDurationMinutes { get; set; } = 0;
        
        public int MaxEnrollments { get; set; } = 0; // 0 = unlimited
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public bool IsFeatured { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string CreatedBy { get; set; } = string.Empty;
        
        public string UpdatedBy { get; set; } = string.Empty;
        
        public int Version { get; set; } = 1;
    }

    public class CourseModule
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public int EstimatedDurationMinutes { get; set; } = 0;
        public bool IsRequired { get; set; } = true;
        public List<Lesson> Lessons { get; set; } = new();
        public List<Assessment> Assessments { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Lesson
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public LessonType Type { get; set; } = LessonType.Text;
        public int OrderIndex { get; set; } = 0;
        public int EstimatedDurationMinutes { get; set; } = 0;
        public bool IsRequired { get; set; } = true;
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }
        public List<string> ResourceUrls { get; set; } = new();
        public List<string> AttachmentUrls { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Assessment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public AssessmentType Type { get; set; } = AssessmentType.Quiz;
        public int OrderIndex { get; set; } = 0;
        public int TimeLimit { get; set; } = 0; // minutes, 0 = no limit
        public int MaxAttempts { get; set; } = 3;
        public int PassingScore { get; set; } = 70;
        public bool IsRequired { get; set; } = true;
        public List<Question> Questions { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Question
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; } = QuestionType.MultipleChoice;
        public int Points { get; set; } = 1;
        public int OrderIndex { get; set; } = 0;
        public List<AnswerOption> Options { get; set; } = new();
        public string? Explanation { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class AnswerOption
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
        public int OrderIndex { get; set; } = 0;
    }

    public class CourseMetadata
    {
        public string Language { get; set; } = "en";
        public List<string> Subtitles { get; set; } = new();
        public string CertificateTemplate { get; set; } = string.Empty;
        public bool HasCertificate { get; set; } = false;
        public int ContinuousEducationUnits { get; set; } = 0;
        public List<string> TargetAudience { get; set; } = new();
        public List<string> Topics { get; set; } = new();
    }

    public class CourseSettings
    {
        public bool AllowDiscussions { get; set; } = true;
        public bool AllowDownloads { get; set; } = false;
        public bool RequireSequentialProgress { get; set; } = true;
        public bool AllowSkipping { get; set; } = false;
        public bool ShowProgress { get; set; } = true;
        public bool AllowReAttempts { get; set; } = true;
        public int DaysToComplete { get; set; } = 0; // 0 = no limit
        public bool IsPublic { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
    }

    public class CourseStatistics
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

    public enum CourseStatus
    {
        Draft,
        Published,
        Archived,
        UnderReview,
        Suspended
    }

    public enum LessonType
    {
        Text,
        Video,
        Audio,
        Interactive,
        Document,
        Presentation,
        ExternalLink
    }

    public enum AssessmentType
    {
        Quiz,
        Assignment,
        Project,
        PeerReview,
        Survey,
        FinalExam
    }

    public enum QuestionType
    {
        MultipleChoice,
        SingleChoice,
        TrueFalse,
        ShortAnswer,
        Essay,
        FillInTheBlank,
        Matching,
        Ordering
    }
}
