using LearningAssistApi.Models;
using LiteDB;

namespace LearningAssistApi.Repositories
{
    public class LearningPathRepository : Repository<LearningPath>, ILearningPathRepository
    {
        private readonly ILiteDatabase _database;
        private readonly ILiteCollection<LearningPath> _collection;

        public LearningPathRepository(ILiteDatabase database) : base(database)
        {
            _database = database;
            _collection = _database.GetCollection<LearningPath>();
            
            // Create indexes for better performance
            _collection.EnsureIndex(x => x.Title);
            _collection.EnsureIndex(x => x.CreatedBy);
            _collection.EnsureIndex(x => x.CareerGoals);
            _collection.EnsureIndex(x => x.Skills);
            _collection.EnsureIndex(x => x.IsActive);
            _collection.EnsureIndex(x => x.IsFeatured);
            _collection.EnsureIndex(x => x.CreatedAt);
            _collection.EnsureIndex(x => x.Statistics.TotalEnrollments);
        }

        public async Task<IEnumerable<LearningPath>> GetLearningPathsWithFiltersAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? careerGoals = null,
            List<string>? skills = null,
            DifficultyLevel? difficulty = null,
            LearningPathType? type = null,
            bool? isActive = true,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? createdBy = null)
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

                if (type.HasValue)
                    query = query.Where(x => x.Type == type.Value);

                if (!string.IsNullOrEmpty(createdBy))
                    query = query.Where(x => x.CreatedBy == createdBy);

                if (careerGoals != null && careerGoals.Any())
                    query = query.Where(x => x.CareerGoals.Any(c => careerGoals.Contains(c)));

                if (skills != null && skills.Any())
                    query = query.Where(x => x.Skills.Any(s => skills.Contains(s)));

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var term = searchTerm.ToLowerInvariant();
                    query = query.Where(x => 
                        x.Title.ToLowerInvariant().Contains(term) ||
                        x.Description.ToLowerInvariant().Contains(term) ||
                        x.CreatedByName.ToLowerInvariant().Contains(term) ||
                        x.Skills.Any(s => s.ToLowerInvariant().Contains(term)) ||
                        x.CareerGoals.Any(c => c.ToLowerInvariant().Contains(term)));
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

        public async Task<LearningPath?> GetLearningPathWithCoursesAsync(string pathId)
        {
            return await GetByIdAsync(pathId);
        }

        public async Task<IEnumerable<LearningPath>> GetLearningPathsByCreatorAsync(string creatorId)
        {
            return await FindAsync(x => x.CreatedBy == creatorId);
        }

        public async Task<IEnumerable<LearningPath>> GetFeaturedLearningPathsAsync(int limit = 10)
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

        public async Task<IEnumerable<LearningPath>> GetRecentLearningPathsAsync(int limit = 10)
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

        public async Task<IEnumerable<LearningPath>> GetPopularLearningPathsAsync(int limit = 10)
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

        public async Task<bool> UpdateLearningPathStatisticsAsync(string pathId, LearningPathStatistics statistics)
        {
            try
            {
                var learningPath = await GetByIdAsync(pathId);
                if (learningPath == null) return false;

                learningPath.Statistics = statistics;
                learningPath.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(learningPath);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> IncrementEnrollmentAsync(string pathId)
        {
            try
            {
                var learningPath = await GetByIdAsync(pathId);
                if (learningPath == null) return false;

                learningPath.Statistics.TotalEnrollments++;
                learningPath.Statistics.ActiveEnrollments++;
                learningPath.Statistics.LastEnrollmentDate = DateTime.UtcNow;
                learningPath.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(learningPath);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DecrementEnrollmentAsync(string pathId)
        {
            try
            {
                var learningPath = await GetByIdAsync(pathId);
                if (learningPath == null) return false;

                if (learningPath.Statistics.ActiveEnrollments > 0)
                    learningPath.Statistics.ActiveEnrollments--;
                
                learningPath.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(learningPath);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateLearningPathRatingAsync(string pathId, double newAverageRating, int totalRatings)
        {
            try
            {
                var learningPath = await GetByIdAsync(pathId);
                if (learningPath == null) return false;

                learningPath.Statistics.AverageRating = newAverageRating;
                learningPath.Statistics.TotalRatings = totalRatings;
                learningPath.UpdatedAt = DateTime.UtcNow;

                return await UpdateAsync(learningPath);
            }
            catch
            {
                return false;
            }
        }
    }
}
