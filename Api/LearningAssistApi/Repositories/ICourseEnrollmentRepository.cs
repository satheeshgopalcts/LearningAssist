using LearningAssistApi.Models;

namespace LearningAssistApi.Repositories
{
    public interface ICourseEnrollmentRepository : IRepository<CourseEnrollment>
    {
        Task<CourseEnrollment?> GetEnrollmentAsync(string userId, string courseId);
        Task<IEnumerable<CourseEnrollment>> GetUserEnrollmentsAsync(string userId, EnrollmentStatus? status = null);
        Task<IEnumerable<CourseEnrollment>> GetCourseEnrollmentsAsync(string courseId, EnrollmentStatus? status = null);
        Task<bool> IsUserEnrolledAsync(string userId, string courseId);
        Task<int> GetCourseEnrollmentCountAsync(string courseId, EnrollmentStatus? status = null);
        Task<int> GetUserActiveEnrollmentCountAsync(string userId);
        Task<IEnumerable<CourseEnrollment>> GetCompletedEnrollmentsAsync(string userId, int limit = 10);
        Task<IEnumerable<CourseEnrollment>> GetInProgressEnrollmentsAsync(string userId, int limit = 10);
        Task<bool> UpdateProgressAsync(string enrollmentId, EnrollmentProgress progress);
        Task<bool> AddModuleProgressAsync(string enrollmentId, ModuleProgress moduleProgress);
        Task<bool> UpdateModuleProgressAsync(string enrollmentId, string moduleId, ModuleProgress moduleProgress);
        Task<bool> AddAssessmentAttemptAsync(string enrollmentId, AssessmentAttempt attempt);
        Task<bool> CompleteEnrollmentAsync(string enrollmentId, DateTime completedAt);
        Task<bool> RateCourseAsync(string enrollmentId, CourseRating rating);
    }
}
