using LearningAssistApi.Models;
using LiteDB;

namespace LearningAssistApi.Repositories
{
    public class CourseEnrollmentRepository : Repository<CourseEnrollment>, ICourseEnrollmentRepository
    {
        private readonly ILiteDatabase _database;
        private readonly ILiteCollection<CourseEnrollment> _collection;

        public CourseEnrollmentRepository(ILiteDatabase database) : base(database)
        {
            _database = database;
            _collection = _database.GetCollection<CourseEnrollment>();
            
            // Create indexes for better performance
            _collection.EnsureIndex(x => x.UserId);
            _collection.EnsureIndex(x => x.CourseId);
            _collection.EnsureIndex(x => x.Status);
            _collection.EnsureIndex(x => x.EnrolledAt);
            _collection.EnsureIndex(x => x.LastAccessedAt);
        }

        public async Task<CourseEnrollment?> GetEnrollmentAsync(string userId, string courseId)
        {
            return await FindOneAsync(x => x.UserId == userId && x.CourseId == courseId);
        }

        public async Task<IEnumerable<CourseEnrollment>> GetUserEnrollmentsAsync(string userId, EnrollmentStatus? status = null)
        {
            if (status.HasValue)
                return await FindAsync(x => x.UserId == userId && x.Status == status.Value);
            
            return await FindAsync(x => x.UserId == userId);
        }

        public async Task<IEnumerable<CourseEnrollment>> GetCourseEnrollmentsAsync(string courseId, EnrollmentStatus? status = null)
        {
            if (status.HasValue)
                return await FindAsync(x => x.CourseId == courseId && x.Status == status.Value);
            
            return await FindAsync(x => x.CourseId == courseId);
        }

        public async Task<bool> IsUserEnrolledAsync(string userId, string courseId)
        {
            return await ExistsAsync(x => x.UserId == userId && x.CourseId == courseId && x.IsActive);
        }

        public async Task<int> GetCourseEnrollmentCountAsync(string courseId, EnrollmentStatus? status = null)
        {
            if (status.HasValue)
                return await CountAsync(x => x.CourseId == courseId && x.Status == status.Value);
            
            return await CountAsync(x => x.CourseId == courseId && x.IsActive);
        }

        public async Task<int> GetUserActiveEnrollmentCountAsync(string userId)
        {
            return await CountAsync(x => x.UserId == userId && 
                (x.Status == EnrollmentStatus.Active || x.Status == EnrollmentStatus.Active) && x.IsActive);
        }

        public async Task<IEnumerable<CourseEnrollment>> GetCompletedEnrollmentsAsync(string userId, int limit = 10)
        {
            return await Task.Run(() =>
            {
                return _collection.Query()
                    .Where(x => x.UserId == userId && x.Status == EnrollmentStatus.Completed)
                    .OrderBy(x => x.CompletedAt, -1)
                    .Limit(limit)
                    .ToList();
            });
        }

        public async Task<IEnumerable<CourseEnrollment>> GetInProgressEnrollmentsAsync(string userId, int limit = 10)
        {
            return await Task.Run(() =>
            {
                return _collection.Query()
                    .Where(x => x.UserId == userId && x.Status == EnrollmentStatus.Active)
                    .OrderBy(x => x.LastAccessedAt, -1)
                    .Limit(limit)
                    .ToList();
            });
        }

        public async Task<bool> UpdateProgressAsync(string enrollmentId, EnrollmentProgress progress)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                enrollment.Progress = progress;
                enrollment.Progress.LastUpdated = DateTime.UtcNow;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                // Update overall score if all assessments are passed
                if (progress.TotalAssessments > 0 && progress.PassedAssessments == progress.TotalAssessments)
                {
                    var totalScore = enrollment.AssessmentAttempts
                        .Where(a => a.HasPassed)
                        .GroupBy(a => a.AssessmentId)
                        .Select(g => g.Max(a => a.Percentage))
                        .Average();
                    enrollment.OverallScore = totalScore;
                }

                return await UpdateAsync(enrollment);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddModuleProgressAsync(string enrollmentId, ModuleProgress moduleProgress)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                var existingProgress = enrollment.ModuleProgress
                    .FirstOrDefault(mp => mp.ModuleId == moduleProgress.ModuleId);

                if (existingProgress != null)
                {
                    // Update existing progress
                    var index = enrollment.ModuleProgress.IndexOf(existingProgress);
                    enrollment.ModuleProgress[index] = moduleProgress;
                }
                else
                {
                    // Add new progress
                    enrollment.ModuleProgress.Add(moduleProgress);
                }

                enrollment.LastAccessedAt = DateTime.UtcNow;
                return await UpdateAsync(enrollment);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateModuleProgressAsync(string enrollmentId, string moduleId, ModuleProgress moduleProgress)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                var existingProgress = enrollment.ModuleProgress
                    .FirstOrDefault(mp => mp.ModuleId == moduleId);

                if (existingProgress != null)
                {
                    var index = enrollment.ModuleProgress.IndexOf(existingProgress);
                    enrollment.ModuleProgress[index] = moduleProgress;
                    enrollment.LastAccessedAt = DateTime.UtcNow;
                    return await UpdateAsync(enrollment);
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddAssessmentAttemptAsync(string enrollmentId, AssessmentAttempt attempt)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                enrollment.AssessmentAttempts.Add(attempt);
                enrollment.LastAccessedAt = DateTime.UtcNow;

                // Update assessment progress
                var assessmentProgress = enrollment.ModuleProgress
                    .SelectMany(mp => mp.AssessmentProgress)
                    .FirstOrDefault(ap => ap.AssessmentId == attempt.AssessmentId);

                if (assessmentProgress != null)
                {
                    assessmentProgress.AttemptCount++;
                    assessmentProgress.LastAttemptAt = attempt.SubmittedAt ?? DateTime.UtcNow;
                    assessmentProgress.LatestScore = attempt.Percentage;
                    
                    if (attempt.HasPassed && (assessmentProgress.BestScore == null || attempt.Percentage > assessmentProgress.BestScore))
                    {
                        assessmentProgress.BestScore = attempt.Percentage;
                        assessmentProgress.HasPassed = true;
                        assessmentProgress.Status = AssessmentStatus.Passed;
                    }
                    else if (!attempt.HasPassed)
                    {
                        assessmentProgress.Status = AssessmentStatus.Failed;
                    }
                }

                return await UpdateAsync(enrollment);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CompleteEnrollmentAsync(string enrollmentId, DateTime completedAt)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                enrollment.Status = EnrollmentStatus.Completed;
                enrollment.CompletedAt = completedAt;
                enrollment.Progress.ProgressPercentage = 100.0;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                return await UpdateAsync(enrollment);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RateCourseAsync(string enrollmentId, CourseRating rating)
        {
            try
            {
                var enrollment = await GetByIdAsync(enrollmentId);
                if (enrollment == null) return false;

                enrollment.Rating = rating;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                return await UpdateAsync(enrollment);
            }
            catch
            {
                return false;
            }
        }
    }
}
