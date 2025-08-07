using LearningAssistApi.DTOs;
using LearningAssistApi.Models;
using LearningAssistApi.Repositories;
using Microsoft.Extensions.Logging;
using LiteDB;

namespace LearningAssistApi.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ICourseEnrollmentRepository _enrollmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<CourseService> _logger;

        public CourseService(
            ICourseRepository courseRepository,
            ICourseEnrollmentRepository enrollmentRepository,
            IUserRepository userRepository,
            ILogger<CourseService> logger)
        {
            _courseRepository = courseRepository;
            _enrollmentRepository = enrollmentRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<ApiResponse<PaginatedResponse<CourseListDto>>> GetCoursesAsync(
            int page = 1,
            int pageSize = 20,
            List<string>? categories = null,
            DifficultyLevel? difficulty = null,
            List<string>? tags = null,
            bool? isFeatured = null,
            string? searchTerm = null,
            string? instructorId = null,
            string? currentUserId = null)
        {
            try
            {
                var courses = await _courseRepository.GetCoursesWithFiltersAsync(
                    page, pageSize, categories, difficulty, tags, true, isFeatured, searchTerm, instructorId);

                var courseDtos = new List<CourseListDto>();
                
                foreach (var course in courses)
                {
                    var courseDto = MapToCourseListDto(course);
                    
                    // Check enrollment status if user is authenticated
                    if (!string.IsNullOrEmpty(currentUserId))
                    {
                        courseDto.IsEnrolled = await _enrollmentRepository.IsUserEnrolledAsync(currentUserId, course.Id.ToString());
                    }
                    
                    courseDtos.Add(courseDto);
                }

                // Get total count for pagination
                var totalCourses = await _courseRepository.CountAsync(x => x.IsActive);
                var totalPages = (int)Math.Ceiling((double)totalCourses / pageSize);

                var paginatedResponse = new PaginatedResponse<CourseListDto>
                {
                    Data = courseDtos,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    TotalItems = totalCourses,
                    HasNextPage = page < totalPages,
                    HasPreviousPage = page > 1
                };

                return ApiResponse<PaginatedResponse<CourseListDto>>.Success(paginatedResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting courses");
                return ApiResponse<PaginatedResponse<CourseListDto>>.Failure("Failed to retrieve courses");
            }
        }

        public async Task<ApiResponse<CourseDto>> GetCourseByIdAsync(string id, string? currentUserId = null)
        {
            try
            {
                var course = await _courseRepository.GetCourseWithModulesAsync(id);
                if (course == null)
                    return ApiResponse<CourseDto>.Failure("Course not found", 404);

                var courseDto = MapToCourseDto(course);

                // Check enrollment status and add progress if user is authenticated
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    var enrollment = await _enrollmentRepository.GetEnrollmentAsync(currentUserId, id);
                    if (enrollment != null)
                    {
                        courseDto.IsEnrolled = true;
                        courseDto.UserProgress = MapToUserProgressDto(enrollment);
                    }
                }

                return ApiResponse<CourseDto>.Success(courseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course {CourseId}", id);
                return ApiResponse<CourseDto>.Failure("Failed to retrieve course");
            }
        }

        public async Task<ApiResponse<CourseDto>> CreateCourseAsync(CreateCourseDto createDto, string instructorId, string instructorName)
        {
            try
            {
                var course = new Course
                {
                    Id = ObjectId.NewObjectId(),
                    Title = createDto.Title,
                    Description = createDto.Description,
                    ShortDescription = createDto.ShortDescription,
                    InstructorId = instructorId,
                    InstructorName = instructorName,
                    Difficulty = createDto.Difficulty,
                    Price = createDto.Price,
                    Currency = createDto.Currency,
                    ThumbnailUrl = createDto.ThumbnailUrl,
                    PreviewVideoUrl = createDto.PreviewVideoUrl,
                    Tags = createDto.Tags,
                    Categories = createDto.Categories,
                    Prerequisites = createDto.Prerequisites,
                    LearningObjectives = createDto.LearningObjectives,
                    EstimatedDurationMinutes = createDto.EstimatedDurationMinutes,
                    MaxEnrollments = createDto.MaxEnrollments,
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    Status = CourseStatus.Draft,
                    CreatedBy = instructorId,
                    UpdatedBy = instructorId,
                    Metadata = MapToMetadata(createDto.Metadata),
                    Settings = MapToSettings(createDto.Settings)
                };

                var created = await _courseRepository.InsertAsync(course);
                var courseDto = MapToCourseDto(created);

                _logger.LogInformation("Course created: {CourseId} by {InstructorId}", created.Id, instructorId);
                return ApiResponse<CourseDto>.Success(courseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return ApiResponse<CourseDto>.Failure("Failed to create course");
            }
        }

        public async Task<ApiResponse<CourseDto>> UpdateCourseAsync(string id, UpdateCourseDto updateDto, string currentUserId)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(id);
                if (course == null)
                    return ApiResponse<CourseDto>.Failure("Course not found", 404);

                // Check if user has permission to update
                if (course.InstructorId != currentUserId)
                    return ApiResponse<CourseDto>.Failure("Unauthorized to update this course", 403);

                // Update fields
                if (!string.IsNullOrEmpty(updateDto.Title))
                    course.Title = updateDto.Title;
                if (!string.IsNullOrEmpty(updateDto.Description))
                    course.Description = updateDto.Description;
                if (!string.IsNullOrEmpty(updateDto.ShortDescription))
                    course.ShortDescription = updateDto.ShortDescription;
                if (updateDto.Difficulty.HasValue)
                    course.Difficulty = updateDto.Difficulty.Value;
                if (updateDto.Price.HasValue)
                    course.Price = updateDto.Price.Value;
                if (!string.IsNullOrEmpty(updateDto.Currency))
                    course.Currency = updateDto.Currency;
                if (!string.IsNullOrEmpty(updateDto.ThumbnailUrl))
                    course.ThumbnailUrl = updateDto.ThumbnailUrl;
                if (!string.IsNullOrEmpty(updateDto.PreviewVideoUrl))
                    course.PreviewVideoUrl = updateDto.PreviewVideoUrl;
                if (updateDto.Tags != null)
                    course.Tags = updateDto.Tags;
                if (updateDto.Categories != null)
                    course.Categories = updateDto.Categories;
                if (updateDto.Prerequisites != null)
                    course.Prerequisites = updateDto.Prerequisites;
                if (updateDto.LearningObjectives != null)
                    course.LearningObjectives = updateDto.LearningObjectives;
                if (updateDto.EstimatedDurationMinutes.HasValue)
                    course.EstimatedDurationMinutes = updateDto.EstimatedDurationMinutes.Value;
                if (updateDto.MaxEnrollments.HasValue)
                    course.MaxEnrollments = updateDto.MaxEnrollments.Value;
                if (updateDto.StartDate.HasValue)
                    course.StartDate = updateDto.StartDate;
                if (updateDto.EndDate.HasValue)
                    course.EndDate = updateDto.EndDate;
                if (updateDto.Status.HasValue)
                    course.Status = updateDto.Status.Value;

                course.UpdatedAt = DateTime.UtcNow;
                course.UpdatedBy = currentUserId;
                course.Version++;

                await _courseRepository.UpdateAsync(course);

                var courseDto = MapToCourseDto(course);
                _logger.LogInformation("Course updated: {CourseId} by {UserId}", id, currentUserId);
                return ApiResponse<CourseDto>.Success(courseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course {CourseId}", id);
                return ApiResponse<CourseDto>.Failure("Failed to update course");
            }
        }

        public async Task<ApiResponse<bool>> DeleteCourseAsync(string id, string currentUserId)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(id);
                if (course == null)
                    return ApiResponse<bool>.Failure("Course not found", 404);

                // Check if user has permission to delete
                if (course.InstructorId != currentUserId)
                    return ApiResponse<bool>.Failure("Unauthorized to delete this course", 403);

                // Soft delete - mark as inactive
                course.IsActive = false;
                course.UpdatedAt = DateTime.UtcNow;
                course.UpdatedBy = currentUserId;

                await _courseRepository.UpdateAsync(course);

                _logger.LogInformation("Course deleted: {CourseId} by {UserId}", id, currentUserId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course {CourseId}", id);
                return ApiResponse<bool>.Failure("Failed to delete course");
            }
        }

        public async Task<ApiResponse<List<CourseListDto>>> GetFeaturedCoursesAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var courses = await _courseRepository.GetFeaturedCoursesAsync(limit);
                var courseDtos = await MapToCourseDtosWithEnrollmentStatus(courses, currentUserId);
                
                return ApiResponse<List<CourseListDto>>.Success(courseDtos.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured courses");
                return ApiResponse<List<CourseListDto>>.Failure("Failed to retrieve featured courses");
            }
        }

        public async Task<ApiResponse<List<CourseListDto>>> GetRecentCoursesAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var courses = await _courseRepository.GetRecentCoursesAsync(limit);
                var courseDtos = await MapToCourseDtosWithEnrollmentStatus(courses, currentUserId);
                
                return ApiResponse<List<CourseListDto>>.Success(courseDtos.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent courses");
                return ApiResponse<List<CourseListDto>>.Failure("Failed to retrieve recent courses");
            }
        }

        public async Task<ApiResponse<List<CourseListDto>>> GetPopularCoursesAsync(int limit = 10, string? currentUserId = null)
        {
            try
            {
                var courses = await _courseRepository.GetPopularCoursesAsync(limit);
                var courseDtos = await MapToCourseDtosWithEnrollmentStatus(courses, currentUserId);
                
                return ApiResponse<List<CourseListDto>>.Success(courseDtos.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular courses");
                return ApiResponse<List<CourseListDto>>.Failure("Failed to retrieve popular courses");
            }
        }

        public async Task<ApiResponse<List<CourseListDto>>> GetInstructorCoursesAsync(string instructorId, string? currentUserId = null)
        {
            try
            {
                var courses = await _courseRepository.GetCoursesByInstructorAsync(instructorId);
                var courseDtos = await MapToCourseDtosWithEnrollmentStatus(courses, currentUserId);
                
                return ApiResponse<List<CourseListDto>>.Success(courseDtos.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting instructor courses for {InstructorId}", instructorId);
                return ApiResponse<List<CourseListDto>>.Failure("Failed to retrieve instructor courses");
            }
        }

        public async Task<ApiResponse<bool>> EnrollInCourseAsync(string courseId, string userId, string userName, string? learningPathId = null)
        {
            try
            {
                // Check if course exists and is active
                var course = await _courseRepository.GetByIdAsync(courseId);
                if (course == null || !course.IsActive)
                    return ApiResponse<bool>.Failure("Course not found or not available", 404);

                // Check if user is already enrolled
                var existingEnrollment = await _enrollmentRepository.GetEnrollmentAsync(userId, courseId);
                if (existingEnrollment != null && existingEnrollment.IsActive)
                    return ApiResponse<bool>.Failure("Already enrolled in this course", 400);

                // Check enrollment limits
                if (course.MaxEnrollments > 0)
                {
                    var enrollmentCount = await _enrollmentRepository.GetCourseEnrollmentCountAsync(courseId, EnrollmentStatus.Active);
                    if (enrollmentCount >= course.MaxEnrollments)
                        return ApiResponse<bool>.Failure("Course enrollment limit reached", 400);
                }

                // Create enrollment
                var enrollment = new CourseEnrollment
                {
                    Id = ObjectId.NewObjectId(),
                    UserId = userId,
                    CourseId = courseId,
                    UserName = userName,
                    CourseTitle = course.Title,
                    Status = EnrollmentStatus.Active,
                    EnrollmentSource = !string.IsNullOrEmpty(learningPathId) ? "LearningPath" : "Direct",
                    LearningPathId = learningPathId,
                    Progress = new EnrollmentProgress
                    {
                        TotalModules = course.Modules.Count,
                        TotalLessons = course.Modules.Sum(m => m.Lessons.Count),
                        TotalAssessments = course.Modules.Sum(m => m.Assessments.Count)
                    }
                };

                await _enrollmentRepository.InsertAsync(enrollment);

                // Update course statistics
                await _courseRepository.IncrementEnrollmentAsync(courseId);

                _logger.LogInformation("User {UserId} enrolled in course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling user {UserId} in course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Failure("Failed to enroll in course");
            }
        }

        public async Task<ApiResponse<bool>> UnenrollFromCourseAsync(string courseId, string userId)
        {
            try
            {
                var enrollment = await _enrollmentRepository.GetEnrollmentAsync(userId, courseId);
                if (enrollment == null)
                    return ApiResponse<bool>.Failure("Not enrolled in this course", 404);

                // Mark enrollment as dropped
                enrollment.Status = EnrollmentStatus.Dropped;
                enrollment.IsActive = false;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                await _enrollmentRepository.UpdateAsync(enrollment);

                // Update course statistics
                await _courseRepository.DecrementEnrollmentAsync(courseId);

                _logger.LogInformation("User {UserId} unenrolled from course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unenrolling user {UserId} from course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Failure("Failed to unenroll from course");
            }
        }

        public async Task<ApiResponse<CourseEnrollmentDto>> GetEnrollmentAsync(string courseId, string userId)
        {
            try
            {
                var enrollment = await _enrollmentRepository.GetEnrollmentAsync(userId, courseId);
                if (enrollment == null)
                    return ApiResponse<CourseEnrollmentDto>.Failure("Enrollment not found", 404);

                var enrollmentDto = MapToCourseEnrollmentDto(enrollment);
                return ApiResponse<CourseEnrollmentDto>.Success(enrollmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting enrollment for user {UserId} and course {CourseId}", userId, courseId);
                return ApiResponse<CourseEnrollmentDto>.Failure("Failed to retrieve enrollment");
            }
        }

        public async Task<ApiResponse<List<CourseEnrollmentDto>>> GetUserEnrollmentsAsync(string userId, EnrollmentStatus? status = null)
        {
            try
            {
                var enrollments = await _enrollmentRepository.GetUserEnrollmentsAsync(userId, status);
                var enrollmentDtos = enrollments.Select(MapToCourseEnrollmentDto).ToList();
                
                return ApiResponse<List<CourseEnrollmentDto>>.Success(enrollmentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting enrollments for user {UserId}", userId);
                return ApiResponse<List<CourseEnrollmentDto>>.Failure("Failed to retrieve enrollments");
            }
        }

        public async Task<ApiResponse<bool>> UpdateCourseProgressAsync(string courseId, string userId, UpdateProgressDto progressDto)
        {
            try
            {
                var enrollment = await _enrollmentRepository.GetEnrollmentAsync(userId, courseId);
                if (enrollment == null)
                    return ApiResponse<bool>.Failure("Not enrolled in this course", 404);

                // Update module progress
                var moduleProgress = enrollment.ModuleProgress.FirstOrDefault(mp => mp.ModuleId == progressDto.ModuleId);
                if (moduleProgress == null)
                {
                    moduleProgress = new ModuleProgress
                    {
                        ModuleId = progressDto.ModuleId,
                        Status = progressDto.ModuleStatus,
                        TimeSpentMinutes = progressDto.TimeSpentMinutes,
                        ProgressPercentage = progressDto.ProgressPercentage
                    };
                    enrollment.ModuleProgress.Add(moduleProgress);
                }
                else
                {
                    moduleProgress.Status = progressDto.ModuleStatus;
                    moduleProgress.TimeSpentMinutes += progressDto.TimeSpentMinutes;
                    moduleProgress.ProgressPercentage = progressDto.ProgressPercentage;
                }

                // Update lesson progress if provided
                if (!string.IsNullOrEmpty(progressDto.LessonId) && progressDto.LessonStatus.HasValue)
                {
                    var lessonProgress = moduleProgress.LessonProgress.FirstOrDefault(lp => lp.LessonId == progressDto.LessonId);
                    if (lessonProgress == null)
                    {
                        lessonProgress = new LessonProgress
                        {
                            LessonId = progressDto.LessonId,
                            Status = progressDto.LessonStatus.Value,
                            TimeSpentMinutes = progressDto.TimeSpentMinutes,
                            ProgressPercentage = progressDto.ProgressPercentage
                        };
                        moduleProgress.LessonProgress.Add(lessonProgress);
                    }
                    else
                    {
                        lessonProgress.Status = progressDto.LessonStatus.Value;
                        lessonProgress.TimeSpentMinutes += progressDto.TimeSpentMinutes;
                        lessonProgress.ProgressPercentage = progressDto.ProgressPercentage;
                    }
                }

                // Recalculate overall progress
                var completedModules = enrollment.ModuleProgress.Count(mp => mp.Status == ModuleStatus.Completed);
                var completedLessons = enrollment.ModuleProgress.SelectMany(mp => mp.LessonProgress).Count(lp => lp.Status == LessonStatus.Completed);
                
                enrollment.Progress.CompletedModules = completedModules;
                enrollment.Progress.CompletedLessons = completedLessons;
                enrollment.Progress.ProgressPercentage = enrollment.Progress.TotalModules > 0 
                    ? (double)completedModules / enrollment.Progress.TotalModules * 100 
                    : 0;

                enrollment.TotalTimeSpentMinutes += progressDto.TimeSpentMinutes;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                await _enrollmentRepository.UpdateAsync(enrollment);

                _logger.LogInformation("Progress updated for user {UserId} in course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating progress for user {UserId} in course {CourseId}", userId, courseId);
                return ApiResponse<bool>.Failure("Failed to update progress");
            }
        }

        public async Task<ApiResponse<bool>> RateCourseAsync(string courseId, string userId, RateCourseDto ratingDto)
        {
            try
            {
                var enrollment = await _enrollmentRepository.GetEnrollmentAsync(userId, courseId);
                if (enrollment == null)
                    return ApiResponse<bool>.Failure("Not enrolled in this course", 404);

                var rating = new CourseRating
                {
                    Rating = ratingDto.Rating,
                    Review = ratingDto.Review,
                    IsPublic = ratingDto.IsPublic,
                    Tags = ratingDto.Tags,
                    RatedAt = DateTime.UtcNow
                };

                await _enrollmentRepository.RateCourseAsync(enrollment.Id.ToString(), rating);

                // Update course average rating (simplified calculation)
                var courseEnrollments = await _enrollmentRepository.GetCourseEnrollmentsAsync(courseId);
                var ratingsWithValues = courseEnrollments.Where(e => e.Rating != null).ToList();
                
                if (ratingsWithValues.Any())
                {
                    var averageRating = ratingsWithValues.Average(e => e.Rating!.Rating);
                    var totalRatings = ratingsWithValues.Count;
                    
                    await _courseRepository.UpdateCourseRatingAsync(courseId, averageRating, totalRatings);
                }

                _logger.LogInformation("Course {CourseId} rated by user {UserId}", courseId, userId);
                return ApiResponse<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rating course {CourseId} by user {UserId}", courseId, userId);
                return ApiResponse<bool>.Failure("Failed to rate course");
            }
        }

        // Private helper methods
        private async Task<IEnumerable<CourseListDto>> MapToCourseDtosWithEnrollmentStatus(IEnumerable<Course> courses, string? currentUserId)
        {
            var courseDtos = new List<CourseListDto>();
            
            foreach (var course in courses)
            {
                var courseDto = MapToCourseListDto(course);
                
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    courseDto.IsEnrolled = await _enrollmentRepository.IsUserEnrolledAsync(currentUserId, course.Id.ToString());
                }
                
                courseDtos.Add(courseDto);
            }
            
            return courseDtos;
        }

        private static CourseListDto MapToCourseListDto(Course course)
        {
            return new CourseListDto
            {
                Id = course.Id.ToString(),
                Title = course.Title,
                ShortDescription = course.ShortDescription,
                InstructorName = course.InstructorName,
                Difficulty = course.Difficulty,
                Price = course.Price,
                Currency = course.Currency,
                ThumbnailUrl = course.ThumbnailUrl,
                Tags = course.Tags,
                Categories = course.Categories,
                EstimatedDurationMinutes = course.EstimatedDurationMinutes,
                AverageRating = course.Statistics.AverageRating,
                TotalRatings = course.Statistics.TotalRatings,
                TotalEnrollments = course.Statistics.TotalEnrollments,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt
            };
        }

        private static CourseDto MapToCourseDto(Course course)
        {
            return new CourseDto
            {
                Id = course.Id.ToString(),
                Title = course.Title,
                Description = course.Description,
                ShortDescription = course.ShortDescription,
                InstructorId = course.InstructorId,
                InstructorName = course.InstructorName,
                Status = course.Status,
                Difficulty = course.Difficulty,
                Price = course.Price,
                Currency = course.Currency,
                ThumbnailUrl = course.ThumbnailUrl,
                PreviewVideoUrl = course.PreviewVideoUrl,
                Tags = course.Tags,
                Categories = course.Categories,
                Prerequisites = course.Prerequisites,
                LearningObjectives = course.LearningObjectives,
                Metadata = MapToMetadataDto(course.Metadata),
                Settings = MapToSettingsDto(course.Settings),
                Statistics = MapToStatisticsDto(course.Statistics),
                EstimatedDurationMinutes = course.EstimatedDurationMinutes,
                MaxEnrollments = course.MaxEnrollments,
                StartDate = course.StartDate,
                EndDate = course.EndDate,
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                CreatedBy = course.CreatedBy,
                Version = course.Version,
                Modules = course.Modules.Select(MapToModuleDto).ToList()
            };
        }

        private static CourseEnrollmentDto MapToCourseEnrollmentDto(CourseEnrollment enrollment)
        {
            return new CourseEnrollmentDto
            {
                Id = enrollment.Id.ToString(),
                UserId = enrollment.UserId,
                CourseId = enrollment.CourseId,
                UserName = enrollment.UserName,
                CourseTitle = enrollment.CourseTitle,
                Status = enrollment.Status,
                EnrolledAt = enrollment.EnrolledAt,
                StartedAt = enrollment.StartedAt,
                CompletedAt = enrollment.CompletedAt,
                CertificateIssuedAt = enrollment.CertificateIssuedAt,
                LastAccessedAt = enrollment.LastAccessedAt,
                Progress = MapToEnrollmentProgressDto(enrollment.Progress),
                ModuleProgress = enrollment.ModuleProgress.Select(MapToModuleProgressDto).ToList(),
                Rating = enrollment.Rating != null ? MapToCourseRatingDto(enrollment.Rating) : null,
                TotalTimeSpentMinutes = enrollment.TotalTimeSpentMinutes,
                OverallScore = enrollment.OverallScore,
                HasCertificate = enrollment.HasCertificate,
                CertificateUrl = enrollment.CertificateUrl,
                EnrollmentSource = enrollment.EnrollmentSource,
                LearningPathId = enrollment.LearningPathId
            };
        }

        private static UserProgressDto MapToUserProgressDto(CourseEnrollment enrollment)
        {
            return new UserProgressDto
            {
                OverallProgress = enrollment.Progress.ProgressPercentage,
                CompletedModules = enrollment.Progress.CompletedModules,
                TotalModules = enrollment.Progress.TotalModules,
                CompletedLessons = enrollment.Progress.CompletedLessons,
                TotalLessons = enrollment.Progress.TotalLessons,
                TimeSpentMinutes = enrollment.TotalTimeSpentMinutes,
                LastAccessedAt = enrollment.LastAccessedAt
            };
        }

        // Additional mapping methods would go here...
        // These are simplified implementations - full implementations would include all mapping methods

        private static CourseMetadata MapToMetadata(CreateCourseMetadataDto? dto) => new CourseMetadata();
        private static CourseSettings MapToSettings(CreateCourseSettingsDto? dto) => new CourseSettings();
        private static CourseMetadataDto MapToMetadataDto(CourseMetadata metadata) => new CourseMetadataDto();
        private static CourseSettingsDto MapToSettingsDto(CourseSettings settings) => new CourseSettingsDto();
        private static CourseStatisticsDto MapToStatisticsDto(CourseStatistics statistics) => new CourseStatisticsDto();
        private static CourseModuleDto MapToModuleDto(CourseModule module) => new CourseModuleDto();
        private static EnrollmentProgressDto MapToEnrollmentProgressDto(EnrollmentProgress progress) => new EnrollmentProgressDto();
        private static ModuleProgressDto MapToModuleProgressDto(ModuleProgress progress) => new ModuleProgressDto();
        private static CourseRatingDto MapToCourseRatingDto(CourseRating rating) => new CourseRatingDto();
    }
}
