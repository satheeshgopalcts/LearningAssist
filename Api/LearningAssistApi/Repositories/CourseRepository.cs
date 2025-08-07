using LearningAssistApi.Models;
using LiteDB;
using System.Linq.Expressions;

namespace LearningAssistApi.Repositories
{
    public class CourseRepository : Repository<Course>, ICourseRepository
    {
        private readonly ILiteDatabase _database;
        private readonly ILiteCollection<Course> _collection;

        public CourseRepository(ILiteDatabase database) : base(database)
        {
            _database = database;
            _collection = _database.GetCollection<Course>();
            
            // Create indexes for better performance
            _collection.EnsureIndex(x => x.Title);
            _collection.EnsureIndex(x => x.InstructorId);
            _collection.EnsureIndex(x => x.Categories);
            _collection.EnsureIndex(x => x.Tags);
            _collection.EnsureIndex(x => x.IsActive);
            _collection.EnsureIndex(x => x.IsFeatured);
            _collection.EnsureIndex(x => x.CreatedAt);
            _collection.EnsureIndex(x => x.Statistics.TotalEnrollments);
        }

        public async Task<IEnumerable<Course>> GetCoursesWithFiltersAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? categories = null,
            DifficultyLevel? difficulty = null,
            List<string>? tags = null,
            bool? isActive = true,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? instructorId = null)
        {
            return await Task.Run(() =>
            {
                var query = _collection.Query();

                // Apply filters
                if (isActive.HasValue)
                    query = query.Where(x => x.IsActive == isActive.Value);

                if (isFeatured.HasValue)
                    query = query.Where(x => x.IsFeatured == isFeatured.Value);

                if (difficulty.HasValue)
                    query = query.Where(x => x.Difficulty == difficulty.Value);

                if (!string.IsNullOrEmpty(instructorId))
                    query = query.Where(x => x.InstructorId == instructorId);

                if (categories != null && categories.Any())
                    query = query.Where(x => x.Categories.Any(c => categories.Contains(c)));

                if (tags != null && tags.Any())
                    query = query.Where(x => x.Tags.Any(t => tags.Contains(t)));

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var term = searchTerm.ToLowerInvariant();
                    query = query.Where(x => 
                        x.Title.ToLowerInvariant().Contains(term) ||
                        x.Description.ToLowerInvariant().Contains(term) ||
                        x.InstructorName.ToLowerInvariant().Contains(term) ||
                        x.Tags.Any(t => t.ToLowerInvariant().Contains(term)));
                }

                // Apply pagination
                var skip = (page - 1) * pageSize;
                
                return query
                    .OrderBy(x => x.IsFeatured ? 0 : 1) // Featured first
                    .Skip(skip)
                    .Limit(pageSize)
                    .ToList();
            });
        }

        public async Task<Course?> GetCourseWithModulesAsync(string courseId)
        {
            return await GetByIdAsync(courseId);
        }

        public async Task<IEnumerable<Course>> GetCoursesByInstructorAsync(string instructorId)
        {
            return await FindAsync(x => x.InstructorId == instructorId);
        }

        public async Task<IEnumerable<Course>> GetFeaturedCoursesAsync(int limit = 10)
        {
            return await Task.Run(() =>
            {
                return _collection.Query()
                    .Where(x => x.IsFeatured && x.IsActive)
                    .OrderBy(x => x.Statistics.TotalEnrollments, -1)
                    .Limit(limit)
                    .ToList();
            });
        }

        public async Task<IEnumerable<Course>> GetRecentCoursesAsync(int limit = 10)
        {
            return await Task.Run(() =>
            {
                return _collection.Query()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.CreatedAt, -1)
                    .Limit(limit)
                    .ToList();
            });
        }

        public async Task<IEnumerable<Course>> GetPopularCoursesAsync(int limit = 10)
        {
            return await Task.Run(() =>
            {
                return _collection.Query()
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.Statistics.TotalEnrollments, -1)
                    .Limit(limit)
                    .ToList();
            });
        }

        public async Task<bool> UpdateCourseStatisticsAsync(string courseId, CourseStatistics statistics)
        {
            try
            {
                var course = await GetByIdAsync(courseId);
                if (course == null) return false;

                course.Statistics = statistics;
                course.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(course);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> IncrementEnrollmentAsync(string courseId)
        {
            try
            {
                var course = await GetByIdAsync(courseId);
                if (course == null) return false;

                course.Statistics.TotalEnrollments++;
                course.Statistics.ActiveEnrollments++;
                course.Statistics.LastEnrollmentDate = DateTime.UtcNow;
                course.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(course);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DecrementEnrollmentAsync(string courseId)
        {
            try
            {
                var course = await GetByIdAsync(courseId);
                if (course == null) return false;

                if (course.Statistics.ActiveEnrollments > 0)
                    course.Statistics.ActiveEnrollments--;
                
                course.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(course);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateCourseRatingAsync(string courseId, double newAverageRating, int totalRatings)
        {
            try
            {
                var course = await GetByIdAsync(courseId);
                if (course == null) return false;

                course.Statistics.AverageRating = newAverageRating;
                course.Statistics.TotalRatings = totalRatings;
                course.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(course);
            }
            catch
            {
                return false;
            }
        }
    }
}
