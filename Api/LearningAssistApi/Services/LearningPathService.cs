using LearningAssistApi.DTOs;
using LearningAssistApi.Models;
using LearningAssistApi.Repositories;
using Microsoft.Extensions.Logging;
using LiteDB;

namespace LearningAssistApi.Services
{
    public class LearningPathService : ILearningPathService
    {
        private readonly ILearningPathRepository _learningPathRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly ILogger<LearningPathService> _logger;

        public LearningPathService(
            ILearningPathRepository learningPathRepository,
            ICourseRepository courseRepository,
            IUserRepository userRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            ILogger<LearningPathService> logger)
        {
            _learningPathRepository = learningPathRepository;
            _courseRepository = courseRepository;
            _userRepository = userRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _logger = logger;
        }

        public async Task<ApiResponse<PaginatedResponse<LearningPathListDto>>> GetLearningPathsAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? careerGoals = null,
            List<string>? skills = null,
            DifficultyLevel? difficulty = null,
            LearningPathType? type = null,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? createdBy = null,
            string? currentUserId = null)
        {
            try
            {
                var learningPaths = await _learningPathRepository.GetLearningPathsWithFiltersAsync(
                    page, pageSize, careerGoals, skills, difficulty, type, true, isFeatured, searchTerm, createdBy);

                var learningPathDtos = learningPaths.Select(MapToLearningPathListDto).ToList();

                // Get total count for pagination
                var totalPaths = await _learningPathRepository.CountAsync(x => x.IsActive);
                var totalPages = (int)Math.Ceiling((double)totalPaths / pageSize);

                var paginatedResponse = new PaginatedResponse<LearningPathListDto>
                {
                    Data = learningPathDtos,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    TotalItems = totalPaths,
                    HasNextPage = page < totalPages,
                    HasPreviousPage = page > 1
                };

                return ApiResponse<PaginatedResponse<LearningPathListDto>>.Success(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning paths");
                return ApiResponse<PaginatedResponse<LearningPathListDto>>.Failure("Failed to retrieve learning paths");
            }
        }

        public async Task<ApiResponse<LearningPathDto>> GetLearningPathByIdAsync(string id, string? currentUserId = null)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetLearningPathWithCoursesAsync(id);
                if (learningPath == null)
                    return ApiResponse<LearningPathDto>.Failure("Learning path not found", 404);

                var learningPathDto = MapToLearningPathDto(learningPath);
                return ApiResponse<LearningPathDto>.Success(learningPathDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning path {PathId}", id);
                return ApiResponse<LearningPathDto>.Failure("Failed to retrieve learning path");
            }
        }

        public async Task<ApiResponse<LearningPathDto>> CreateLearningPathAsync(CreateLearningPathDto createDto, string createdBy, string createdByName)
        {
            try
            {
                var learningPath = new LearningPath
                {
                    Id = ObjectId.NewObjectId(),
                    Title = createDto.Title,
                    Description = createDto.Description,
                    ShortDescription = createDto.ShortDescription,
                    CreatedBy = createdBy,
                    CreatedByName = createdByName,
                    Type = createDto.Type,
                    Difficulty = createDto.Difficulty,
                    ThumbnailUrl = createDto.ThumbnailUrl,
                    Tags = createDto.Tags,
                    Categories = createDto.Categories,
                    CareerGoals = createDto.CareerGoals,
                    Skills = createDto.Skills,
                    EstimatedDurationDays = createDto.EstimatedDurationDays,
                    EstimatedHours = createDto.EstimatedHours,
                    IsPublic = createDto.IsPublic
                };

                // Add courses to the learning path
                if (createDto.CourseIds != null && createDto.CourseIds.Any())
                {
                    for (int i = 0; i < createDto.CourseIds.Count; i++)
                    {
                        var courseId = createDto.CourseIds[i];
                        var course = await _courseRepository.GetByIdAsync(courseId);
                        if (course != null)
                        {
                            var pathCourse = new LearningPathCourse
                            {
                                CourseId = courseId,
                                CourseTitle = course.Title,
                                OrderIndex = i,
                                IsRequired = true,
                                IsUnlocked = i == 0, // First course is always unlocked
                                EstimatedDurationMinutes = course.EstimatedDurationMinutes
                            };
                            learningPath.Courses.Add(pathCourse);
                        }
                    }
                }

                var created = await _learningPathRepository.InsertAsync(learningPath);
                var learningPathDto = MapToLearningPathDto(created);

                _logger.LogInformation("Learning path created: {PathId} by {UserId}", created.Id, createdBy);
                return ApiResponse<LearningPathDto>.Success(learningPathDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating learning path");
                return ApiResponse<LearningPathDto>.Failure("Failed to create learning path");
            }
        }

        public async Task<ApiResponse<LearningPathDto>> UpdateLearningPathAsync(string id, UpdateLearningPathDto updateDto, string currentUserId)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(id);
                if (learningPath == null)
                    return ApiResponse<LearningPathDto>.Failure("Learning path not found", 404);

                // Check if user has permission to update
                if (learningPath.CreatedBy != currentUserId)
                    return ApiResponse<LearningPathDto>.Failure("Unauthorized to update this learning path", 403);

                // Update fields
                if (!string.IsNullOrEmpty(updateDto.Title))
                    learningPath.Title = updateDto.Title;
                if (!string.IsNullOrEmpty(updateDto.Description))
                    learningPath.Description = updateDto.Description;
                if (!string.IsNullOrEmpty(updateDto.ShortDescription))
                    learningPath.ShortDescription = updateDto.ShortDescription;
                if (updateDto.Difficulty.HasValue)
                    learningPath.Difficulty = updateDto.Difficulty.Value;
                if (updateDto.Type.HasValue)
                    learningPath.Type = updateDto.Type.Value;
                if (!string.IsNullOrEmpty(updateDto.ThumbnailUrl))
                    learningPath.ThumbnailUrl = updateDto.ThumbnailUrl;
                if (updateDto.Tags != null)
                    learningPath.Tags = updateDto.Tags;
                if (updateDto.Categories != null)
                    learningPath.Categories = updateDto.Categories;
                if (updateDto.CareerGoals != null)
                    learningPath.CareerGoals = updateDto.CareerGoals;
                if (updateDto.Skills != null)
                    learningPath.Skills = updateDto.Skills;
                if (updateDto.EstimatedDurationDays.HasValue)
                    learningPath.EstimatedDurationDays = updateDto.EstimatedDurationDays.Value;
                if (updateDto.EstimatedHours.HasValue)
                    learningPath.EstimatedHours = updateDto.EstimatedHours.Value;
                if (updateDto.IsPublic.HasValue)
                    learningPath.IsPublic = updateDto.IsPublic.Value;

                learningPath.UpdatedAt = DateTime.UtcNow;
                learningPath.UpdatedBy = currentUserId;
                learningPath.Version++;

                await _learningPathRepository.UpdateAsync(learningPath);

                var learningPathDto = MapToLearningPathDto(learningPath);
                _logger.LogInformation("Learning path updated: {PathId} by {UserId}", id, currentUserId);
                return ApiResponse<LearningPathDto>.Success(learningPathDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating learning path {PathId}", id);
                return ApiResponse<LearningPathDto>.Failure("Failed to update learning path");
            }
        }

        public async Task<ApiResponse<bool>> DeleteLearningPathAsync(string id, string currentUserId)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(id);
                if (learningPath == null)
                    return ApiResponse<bool>.Failure("Learning path not found", 404);

                // Check if user has permission to delete
                if (learningPath.CreatedBy != currentUserId)
                    return ApiResponse<bool>.Failure("Unauthorized to delete this learning path", 403);

                // Soft delete - mark as inactive
                learningPath.IsActive = false;
                learningPath.UpdatedAt = DateTime.UtcNow;
                learningPath.UpdatedBy = currentUserId;

                await _learningPathRepository.UpdateAsync(learningPath);

                _logger.LogInformation("Learning path deleted: {PathId} by {UserId}", id, currentUserId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting learning path {PathId}", id);
                return ApiResponse<bool>.Failure("Failed to delete learning path");
            }
        }

        public async Task<ApiResponse<List<LearningPathListDto>>> GetFeaturedLearningPathsAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var learningPaths = await _learningPathRepository.GetFeaturedLearningPathsAsync(limit);
                var learningPathDtos = learningPaths.Select(MapToLearningPathListDto).ToList();
                
                return ApiResponse<List<LearningPathListDto>>.Success(learningPathDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured learning paths");
                return ApiResponse<List<LearningPathListDto>>.Failure("Failed to retrieve featured learning paths");
            }
        }

        public async Task<ApiResponse<List<LearningPathListDto>>> GetRecentLearningPathsAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var learningPaths = await _learningPathRepository.GetRecentLearningPathsAsync(limit);
                var learningPathDtos = learningPaths.Select(MapToLearningPathListDto).ToList();
                
                return ApiResponse<List<LearningPathListDto>>.Success(learningPathDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent learning paths");
                return ApiResponse<List<LearningPathListDto>>.Failure("Failed to retrieve recent learning paths");
            }
        }

        public async Task<ApiResponse<List<LearningPathListDto>>> GetPopularLearningPathsAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var learningPaths = await _learningPathRepository.GetPopularLearningPathsAsync(limit);
                var learningPathDtos = learningPaths.Select(MapToLearningPathListDto).ToList();
                
                return ApiResponse<List<LearningPathListDto>>.Success(learningPathDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular learning paths");
                return ApiResponse<List<LearningPathListDto>>.Failure("Failed to retrieve popular learning paths");
            }
        }

        public async Task<ApiResponse<List<LearningPathListDto>>> GetUserLearningPathsAsync(string createdBy, string? currentUserId = null)
        {
            try
            {
                var learningPaths = await _learningPathRepository.GetLearningPathsByCreatorAsync(createdBy);
                var learningPathDtos = learningPaths.Select(MapToLearningPathListDto).ToList();
                
                return ApiResponse<List<LearningPathListDto>>.Success(learningPathDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user learning paths for {UserId}", createdBy);
                return ApiResponse<List<LearningPathListDto>>.Failure("Failed to retrieve user learning paths");
            }
        }

        // Placeholder implementations for enrollment-related methods
        public async Task<ApiResponse<bool>> EnrollInLearningPathAsync(string pathId, string userId, string userName)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(pathId);
                if (learningPath == null)
                {
                    return ApiResponse<bool>.Failure("Learning path not found");
                }

                if (!learningPath.IsActive)
                {
                    return ApiResponse<bool>.Failure("Learning path is not active");
                }

                if (!learningPath.IsPublic)
                {
                    return ApiResponse<bool>.Failure("Learning path is not public");
                }

                // Check if already enrolled
                var existingEnrollment = await _courseEnrollmentRepository
                    .FindAsync(x => x.UserId == userId && x.LearningPathId == pathId);
                
                if (existingEnrollment.Any())
                {
                    return ApiResponse<bool>.Failure("Already enrolled in this learning path");
                }

                // Create enrollment for the learning path
                var enrollment = new CourseEnrollment
                {
                    Id = ObjectId.NewObjectId(),
                    UserId = userId,
                    UserName = userName,
                    CourseId = "", // Will be updated for each course
                    LearningPathId = pathId,
                    Status = EnrollmentStatus.Active,
                    EnrolledAt = DateTime.UtcNow,
                    LastAccessedAt = DateTime.UtcNow,
                    EnrollmentSource = "LearningPath",
                    Progress = new EnrollmentProgress()
                };

                // Enroll in each course in the learning path
                foreach (var pathCourse in learningPath.Courses.OrderBy(x => x.OrderIndex))
                {
                    var course = await _courseRepository.GetByIdAsync(pathCourse.CourseId);
                    if (course != null)
                    {
                        var courseEnrollment = new CourseEnrollment
                        {
                            Id = ObjectId.NewObjectId(),
                            UserId = userId,
                            UserName = userName,
                            CourseId = pathCourse.CourseId,
                            LearningPathId = pathId,
                            Status = pathCourse.IsUnlocked ? EnrollmentStatus.Active : EnrollmentStatus.Suspended,
                            EnrolledAt = DateTime.UtcNow,
                            LastAccessedAt = DateTime.UtcNow,
                            EnrollmentSource = "LearningPath",
                            Progress = new EnrollmentProgress()
                        };

                        await _courseEnrollmentRepository.InsertAsync(courseEnrollment);

                        // Update course enrollment statistics
                        course.Statistics.TotalEnrollments++;
                        await _courseRepository.UpdateAsync(course);
                    }
                }

                // Update learning path statistics
                learningPath.Statistics.TotalEnrollments++;
                learningPath.Statistics.ActiveEnrollments++;
                learningPath.Statistics.LastEnrollmentDate = DateTime.UtcNow;
                await _learningPathRepository.UpdateAsync(learningPath);

                return ApiResponse<bool>.Success(true, "Successfully enrolled in learning path");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Failure($"Failed to enroll in learning path: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> UnenrollFromLearningPathAsync(string pathId, string userId)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(pathId);
                if (learningPath == null)
                {
                    return ApiResponse<bool>.Failure("Learning path not found");
                }

                // Get all enrollments for this learning path and user
                var enrollments = await _courseEnrollmentRepository
                    .FindAsync(x => x.UserId == userId && x.LearningPathId == pathId);

                if (!enrollments.Any())
                {
                    return ApiResponse<bool>.Failure("Not enrolled in this learning path");
                }

                // Update course statistics before removing enrollments
                foreach (var enrollment in enrollments)
                {
                    if (!string.IsNullOrEmpty(enrollment.CourseId))
                    {
                        var course = await _courseRepository.GetByIdAsync(enrollment.CourseId);
                        if (course != null)
                        {
                            course.Statistics.TotalEnrollments = Math.Max(0, course.Statistics.TotalEnrollments - 1);
                            if (enrollment.Status == EnrollmentStatus.Active || enrollment.Status == EnrollmentStatus.Active)
                            {
                                course.Statistics.ActiveEnrollments = Math.Max(0, course.Statistics.ActiveEnrollments - 1);
                            }
                            await _courseRepository.UpdateAsync(course);
                        }
                    }

                    // Remove the enrollment
                    await _courseEnrollmentRepository.DeleteAsync(enrollment.Id);
                }

                // Update learning path statistics
                learningPath.Statistics.TotalEnrollments = Math.Max(0, learningPath.Statistics.TotalEnrollments - 1);
                learningPath.Statistics.ActiveEnrollments = Math.Max(0, learningPath.Statistics.ActiveEnrollments - 1);
                await _learningPathRepository.UpdateAsync(learningPath);

                return ApiResponse<bool>.Success(true, "Successfully unenrolled from learning path");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Failure($"Failed to unenroll from learning path: {ex.Message}");
            }
        }

        public async Task<ApiResponse<LearningPathEnrollmentDto>> GetLearningPathEnrollmentAsync(string pathId, string userId)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(pathId);
                if (learningPath == null)
                {
                    return ApiResponse<LearningPathEnrollmentDto>.Failure("Learning path not found");
                }

                var enrollments = await _courseEnrollmentRepository
                    .FindAsync(x => x.UserId == userId && x.LearningPathId == pathId);

                if (!enrollments.Any())
                {
                    return ApiResponse<LearningPathEnrollmentDto>.Failure("Not enrolled in this learning path");
                }

                // Find the main enrollment (one without a specific course ID)
                var mainEnrollment = enrollments.FirstOrDefault(x => string.IsNullOrEmpty(x.CourseId))
                                    ?? enrollments.First(); // Fallback to first if no main enrollment found

                var courseEnrollments = enrollments.Where(x => !string.IsNullOrEmpty(x.CourseId)).ToList();

                var enrollmentDto = new LearningPathEnrollmentDto
                {
                    Id = mainEnrollment.Id.ToString(),
                    UserId = userId,
                    LearningPathId = pathId,
                    LearningPathTitle = learningPath.Title,
                    Status = mainEnrollment.Status,
                    EnrolledAt = mainEnrollment.EnrolledAt,
                    StartedAt = mainEnrollment.StartedAt,
                    CompletedAt = mainEnrollment.CompletedAt,
                    LastAccessedAt = mainEnrollment.LastAccessedAt,
                    TotalTimeSpentMinutes = courseEnrollments.Sum(x => x.TotalTimeSpentMinutes),
                    OverallScore = courseEnrollments.Any() ? courseEnrollments.Average(x => x.OverallScore) : 0,
                    HasCertificate = learningPath.Metadata.HasCertificate && mainEnrollment.Status == EnrollmentStatus.Completed,
                    CertificateUrl = mainEnrollment.CertificateUrl
                };

                // Calculate progress
                var completedCourses = courseEnrollments.Count(x => x.Status == EnrollmentStatus.Completed);
                var totalCourses = learningPath.Courses.Count;

                enrollmentDto.Progress = new LearningPathProgressDto
                {
                    LearningPathId = pathId,
                    EnrolledAt = mainEnrollment.EnrolledAt,
                    StartedAt = mainEnrollment.StartedAt,
                    CompletedAt = mainEnrollment.CompletedAt,
                    LastAccessedAt = mainEnrollment.LastAccessedAt,
                    ProgressPercentage = totalCourses > 0 ? (double)completedCourses / totalCourses * 100 : 0,
                    CompletedCourses = completedCourses,
                    TotalCourses = totalCourses,
                    TotalTimeSpentMinutes = enrollmentDto.TotalTimeSpentMinutes
                };

                // Map course progress
                enrollmentDto.CourseProgress = courseEnrollments.Select(enrollment =>
                {
                    var pathCourse = learningPath.Courses.FirstOrDefault(x => x.CourseId == enrollment.CourseId);
                    return new LearningPathCourseProgressDto
                    {
                        CourseId = enrollment.CourseId,
                        CourseTitle = enrollment.CourseTitle ?? "Unknown Course",
                        OrderIndex = pathCourse?.OrderIndex ?? 0,
                        IsRequired = pathCourse?.IsRequired ?? true,
                        IsUnlocked = pathCourse?.IsUnlocked ?? false,
                        IsEnrolled = true,
                        IsCompleted = enrollment.Status == EnrollmentStatus.Completed,
                        ProgressPercentage = enrollment.Progress?.ProgressPercentage ?? 0,
                        StartedAt = enrollment.StartedAt,
                        CompletedAt = enrollment.CompletedAt,
                        LastAccessedAt = enrollment.LastAccessedAt
                    };
                }).OrderBy(x => x.OrderIndex).ToList();

                return ApiResponse<LearningPathEnrollmentDto>.Success(enrollmentDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<LearningPathEnrollmentDto>.Failure($"Failed to retrieve learning path enrollment: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<LearningPathEnrollmentDto>>> GetUserLearningPathEnrollmentsAsync(string userId)
        {
            try
            {
                // Get all enrollments for the user that are part of learning paths
                var userEnrollments = await _courseEnrollmentRepository
                    .FindAsync(x => x.UserId == userId && !string.IsNullOrEmpty(x.LearningPathId));

                // Group by learning path
                var enrollmentsByPath = userEnrollments
                    .GroupBy(x => x.LearningPathId)
                    .ToList();

                var enrollmentDtos = new List<LearningPathEnrollmentDto>();

                foreach (var pathGroup in enrollmentsByPath)
                {
                    var pathId = pathGroup.Key;
                    if (string.IsNullOrEmpty(pathId)) continue;

                    var learningPath = await _learningPathRepository.GetByIdAsync(pathId);
                    if (learningPath == null) continue;

                    var pathEnrollments = pathGroup.ToList();
                    var mainEnrollment = pathEnrollments.FirstOrDefault(x => string.IsNullOrEmpty(x.CourseId))
                                        ?? pathEnrollments.First();

                    var courseEnrollments = pathEnrollments.Where(x => !string.IsNullOrEmpty(x.CourseId)).ToList();

                    var enrollmentDto = new LearningPathEnrollmentDto
                    {
                        Id = mainEnrollment.Id.ToString(),
                        UserId = userId,
                        LearningPathId = pathId,
                        LearningPathTitle = learningPath.Title,
                        Status = mainEnrollment.Status,
                        EnrolledAt = mainEnrollment.EnrolledAt,
                        StartedAt = mainEnrollment.StartedAt,
                        CompletedAt = mainEnrollment.CompletedAt,
                        LastAccessedAt = mainEnrollment.LastAccessedAt,
                        TotalTimeSpentMinutes = courseEnrollments.Sum(x => x.TotalTimeSpentMinutes),
                        OverallScore = courseEnrollments.Any() ? courseEnrollments.Average(x => x.OverallScore) : 0,
                        HasCertificate = learningPath.Metadata.HasCertificate && mainEnrollment.Status == EnrollmentStatus.Completed,
                        CertificateUrl = mainEnrollment.CertificateUrl
                    };

                    // Calculate progress
                    var completedCourses = courseEnrollments.Count(x => x.Status == EnrollmentStatus.Completed);
                    var totalCourses = learningPath.Courses.Count;

                    enrollmentDto.Progress = new LearningPathProgressDto
                    {
                        LearningPathId = pathId,
                        EnrolledAt = mainEnrollment.EnrolledAt,
                        StartedAt = mainEnrollment.StartedAt,
                        CompletedAt = mainEnrollment.CompletedAt,
                        LastAccessedAt = mainEnrollment.LastAccessedAt,
                        ProgressPercentage = totalCourses > 0 ? (double)completedCourses / totalCourses * 100 : 0,
                        CompletedCourses = completedCourses,
                        TotalCourses = totalCourses,
                        TotalTimeSpentMinutes = enrollmentDto.TotalTimeSpentMinutes
                    };

                    enrollmentDtos.Add(enrollmentDto);
                }

                return ApiResponse<List<LearningPathEnrollmentDto>>.Success(enrollmentDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<LearningPathEnrollmentDto>>.Failure($"Failed to retrieve user learning path enrollments: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> RateLearningPathAsync(string pathId, string userId, RateLearningPathDto ratingDto)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetByIdAsync(pathId);
                if (learningPath == null)
                {
                    return ApiResponse<bool>.Failure("Learning path not found");
                }

                // Check if user is enrolled in the learning path
                var enrollment = await _courseEnrollmentRepository
                    .FindAsync(x => x.UserId == userId && x.LearningPathId == pathId);

                if (!enrollment.Any())
                {
                    return ApiResponse<bool>.Failure("Must be enrolled in learning path to rate it");
                }

                // For now, we'll just update the learning path statistics with a simple average
                // In a full implementation, you might want to store individual ratings in a separate collection
                
                // Get the main enrollment for this user and learning path
                var mainEnrollment = enrollment.FirstOrDefault(x => string.IsNullOrEmpty(x.CourseId))
                                    ?? enrollment.First();

                // Create or update a rating - storing in the enrollment for simplicity
                if (mainEnrollment.Rating == null)
                {
                    mainEnrollment.Rating = new CourseRating
                    {
                        Rating = ratingDto.Rating,
                        Review = ratingDto.Review ?? "",
                        IsPublic = ratingDto.IsPublic,
                        Tags = ratingDto.Tags,
                        RatedAt = DateTime.UtcNow
                    };
                }
                else
                {
                    mainEnrollment.Rating.Rating = ratingDto.Rating;
                    mainEnrollment.Rating.Review = ratingDto.Review ?? "";
                    mainEnrollment.Rating.IsPublic = ratingDto.IsPublic;
                    mainEnrollment.Rating.Tags = ratingDto.Tags;
                    mainEnrollment.Rating.RatedAt = DateTime.UtcNow;
                }

                await _courseEnrollmentRepository.UpdateAsync(mainEnrollment);

                // TODO: Recalculate learning path statistics based on all ratings
                // This would require querying all enrollments for this learning path and averaging their ratings

                return ApiResponse<bool>.Success(true, "Learning path rated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Failure($"Failed to rate learning path: {ex.Message}");
            }
        }

        // Helper mapping methods
        private static LearningPathListDto MapToLearningPathListDto(LearningPath learningPath)
        {
            return new LearningPathListDto
            {
                Id = learningPath.Id.ToString(),
                Title = learningPath.Title,
                ShortDescription = learningPath.ShortDescription,
                CreatedByName = learningPath.CreatedByName,
                Type = learningPath.Type,
                Difficulty = learningPath.Difficulty,
                ThumbnailUrl = learningPath.ThumbnailUrl,
                Tags = learningPath.Tags,
                Categories = learningPath.Categories,
                CareerGoals = learningPath.CareerGoals,
                Skills = learningPath.Skills,
                EstimatedDurationDays = learningPath.EstimatedDurationDays,
                EstimatedHours = learningPath.EstimatedHours,
                CourseCount = learningPath.Courses.Count,
                TotalCourses = learningPath.Courses.Count,
                AverageRating = learningPath.Statistics.AverageRating,
                TotalRatings = learningPath.Statistics.TotalRatings,
                TotalEnrollments = learningPath.Statistics.TotalEnrollments,
                IsFeatured = learningPath.IsFeatured,
                CreatedAt = learningPath.CreatedAt
            };
        }

        private static LearningPathDto MapToLearningPathDto(LearningPath learningPath)
        {
            return new LearningPathDto
            {
                Id = learningPath.Id.ToString(),
                Title = learningPath.Title,
                Description = learningPath.Description,
                ShortDescription = learningPath.ShortDescription,
                CreatedBy = learningPath.CreatedBy,
                CreatedByName = learningPath.CreatedByName,
                Type = learningPath.Type,
                Difficulty = learningPath.Difficulty,
                ThumbnailUrl = learningPath.ThumbnailUrl,
                Tags = learningPath.Tags,
                Categories = learningPath.Categories,
                CareerGoals = learningPath.CareerGoals,
                Skills = learningPath.Skills,
                Courses = learningPath.Courses.Select(MapToLearningPathCourseDto).ToList(),
                Metadata = MapToLearningPathMetadataDto(learningPath.Metadata),
                Statistics = MapToLearningPathStatisticsDto(learningPath.Statistics),
                EstimatedDurationDays = learningPath.EstimatedDurationDays,
                EstimatedHours = learningPath.EstimatedHours,
                IsPublic = learningPath.IsPublic,
                IsActive = learningPath.IsActive,
                IsFeatured = learningPath.IsFeatured,
                CreatedAt = learningPath.CreatedAt,
                UpdatedAt = learningPath.UpdatedAt,
                Version = learningPath.Version
            };
        }

        private static LearningPathCourseDto MapToLearningPathCourseDto(LearningPathCourse course)
        {
            return new LearningPathCourseDto
            {
                CourseId = course.CourseId,
                CourseTitle = course.CourseTitle,
                OrderIndex = course.OrderIndex,
                IsRequired = course.IsRequired,
                IsUnlocked = course.IsUnlocked,
                Prerequisites = course.Prerequisites,
                EstimatedDurationMinutes = course.EstimatedDurationMinutes,
                AddedAt = course.AddedAt
            };
        }

        private static LearningPathMetadataDto MapToLearningPathMetadataDto(LearningPathMetadata metadata)
        {
            return new LearningPathMetadataDto
            {
                TargetAudience = metadata.TargetAudience,
                LearningObjectives = metadata.LearningObjectives,
                Prerequisites = metadata.Prerequisites,
                CertificateTemplate = metadata.CertificateTemplate,
                HasCertificate = metadata.HasCertificate,
                ContinuousEducationUnits = metadata.ContinuousEducationUnits
            };
        }

        private static LearningPathStatisticsDto MapToLearningPathStatisticsDto(LearningPathStatistics statistics)
        {
            return new LearningPathStatisticsDto
            {
                TotalEnrollments = statistics.TotalEnrollments,
                ActiveEnrollments = statistics.ActiveEnrollments,
                CompletedEnrollments = statistics.CompletedEnrollments,
                AverageRating = statistics.AverageRating,
                TotalRatings = statistics.TotalRatings,
                CompletionRate = statistics.CompletionRate,
                AverageCompletionDays = statistics.AverageCompletionDays,
                LastEnrollmentDate = statistics.LastEnrollmentDate,
                LastCompletionDate = statistics.LastCompletionDate
            };
        }
    }
}
