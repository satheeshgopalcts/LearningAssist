using FluentValidation;
using LearningAssistApi.DTOs;
using LearningAssistApi.Models;

namespace LearningAssistApi.Validators
{
    public class CreateLearningPathDtoValidator : AbstractValidator<CreateLearningPathDto>
    {
        public CreateLearningPathDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .Length(2, 200).WithMessage("Title must be between 2 and 200 characters");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required")
                .Length(10, 2000).WithMessage("Description must be between 10 and 2000 characters");

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500).WithMessage("Short description must not exceed 500 characters");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Invalid learning path type");

            RuleFor(x => x.Difficulty)
                .IsInEnum().WithMessage("Invalid difficulty level");

            RuleFor(x => x.ThumbnailUrl)
                .Must(BeAValidUrl).WithMessage("Invalid thumbnail URL")
                .When(x => !string.IsNullOrEmpty(x.ThumbnailUrl));

            RuleFor(x => x.CourseIds)
                .NotEmpty().WithMessage("At least one course is required")
                .Must(HaveUniqueCourseIds).WithMessage("Course IDs must be unique");

            RuleForEach(x => x.CourseIds)
                .NotEmpty().WithMessage("Course ID cannot be empty");

            RuleFor(x => x.EstimatedDurationDays)
                .GreaterThan(0).WithMessage("Estimated duration days must be greater than 0")
                .LessThanOrEqualTo(3650).WithMessage("Estimated duration days cannot exceed 10 years");

            RuleFor(x => x.EstimatedHours)
                .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
                .LessThanOrEqualTo(87600).WithMessage("Estimated hours cannot exceed 10 years");

            RuleFor(x => x.Tags)
                .Must(HaveValidTags).WithMessage("Tags cannot contain empty values");

            RuleFor(x => x.Categories)
                .Must(HaveValidCategories).WithMessage("Categories cannot contain empty values");

            RuleFor(x => x.CareerGoals)
                .Must(HaveValidCareerGoals).WithMessage("Career goals cannot contain empty values");

            RuleFor(x => x.Skills)
                .Must(HaveValidSkills).WithMessage("Skills cannot contain empty values");

            RuleFor(x => x.Metadata)
                .NotNull().WithMessage("Metadata is required");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var result) && 
                   (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
        }

        private bool HaveUniqueCourseIds(List<string> courseIds)
        {
            return courseIds == null || courseIds.Count == courseIds.Distinct().Count();
        }

        private bool HaveValidTags(List<string> tags)
        {
            return tags == null || tags.All(tag => !string.IsNullOrWhiteSpace(tag));
        }

        private bool HaveValidCategories(List<string> categories)
        {
            return categories == null || categories.All(category => !string.IsNullOrWhiteSpace(category));
        }

        private bool HaveValidCareerGoals(List<string> careerGoals)
        {
            return careerGoals == null || careerGoals.All(goal => !string.IsNullOrWhiteSpace(goal));
        }

        private bool HaveValidSkills(List<string> skills)
        {
            return skills == null || skills.All(skill => !string.IsNullOrWhiteSpace(skill));
        }
    }

    public class UpdateLearningPathDtoValidator : AbstractValidator<UpdateLearningPathDto>
    {
        public UpdateLearningPathDtoValidator()
        {
            RuleFor(x => x.Title)
                .Length(2, 200).WithMessage("Title must be between 2 and 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Title));

            RuleFor(x => x.Description)
                .Length(10, 2000).WithMessage("Description must be between 10 and 2000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500).WithMessage("Short description must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.ShortDescription));

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Invalid learning path type")
                .When(x => x.Type.HasValue);

            RuleFor(x => x.Difficulty)
                .IsInEnum().WithMessage("Invalid difficulty level")
                .When(x => x.Difficulty.HasValue);

            RuleFor(x => x.ThumbnailUrl)
                .Must(BeAValidUrl).WithMessage("Invalid thumbnail URL")
                .When(x => !string.IsNullOrEmpty(x.ThumbnailUrl));

            RuleFor(x => x.CourseIds)
                .Must(HaveUniqueCourseIds).WithMessage("Course IDs must be unique")
                .When(x => x.CourseIds != null);

            RuleForEach(x => x.CourseIds)
                .NotEmpty().WithMessage("Course ID cannot be empty")
                .When(x => x.CourseIds != null);

            RuleFor(x => x.EstimatedDurationDays)
                .GreaterThan(0).WithMessage("Estimated duration days must be greater than 0")
                .LessThanOrEqualTo(3650).WithMessage("Estimated duration days cannot exceed 10 years")
                .When(x => x.EstimatedDurationDays.HasValue);

            RuleFor(x => x.EstimatedHours)
                .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
                .LessThanOrEqualTo(87600).WithMessage("Estimated hours cannot exceed 10 years")
                .When(x => x.EstimatedHours.HasValue);

            RuleFor(x => x.Tags)
                .Must(HaveValidTags).WithMessage("Tags cannot contain empty values")
                .When(x => x.Tags != null);

            RuleFor(x => x.Categories)
                .Must(HaveValidCategories).WithMessage("Categories cannot contain empty values")
                .When(x => x.Categories != null);

            RuleFor(x => x.CareerGoals)
                .Must(HaveValidCareerGoals).WithMessage("Career goals cannot contain empty values")
                .When(x => x.CareerGoals != null);

            RuleFor(x => x.Skills)
                .Must(HaveValidSkills).WithMessage("Skills cannot contain empty values")
                .When(x => x.Skills != null);
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var result) && 
                   (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
        }

        private bool HaveUniqueCourseIds(List<string> courseIds)
        {
            return courseIds.Count == courseIds.Distinct().Count();
        }

        private bool HaveValidTags(List<string> tags)
        {
            return tags.All(tag => !string.IsNullOrWhiteSpace(tag));
        }

        private bool HaveValidCategories(List<string> categories)
        {
            return categories.All(category => !string.IsNullOrWhiteSpace(category));
        }

        private bool HaveValidCareerGoals(List<string> careerGoals)
        {
            return careerGoals.All(goal => !string.IsNullOrWhiteSpace(goal));
        }

        private bool HaveValidSkills(List<string> skills)
        {
            return skills.All(skill => !string.IsNullOrWhiteSpace(skill));
        }
    }

    public class LearningPathFilterDtoValidator : AbstractValidator<LearningPathFilterDto>
    {
        public LearningPathFilterDtoValidator()
        {
            RuleFor(x => x.Search)
                .MaximumLength(200).WithMessage("Search term must not exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Search));

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Invalid learning path type")
                .When(x => x.Type.HasValue);

            RuleFor(x => x.Difficulty)
                .IsInEnum().WithMessage("Invalid difficulty level")
                .When(x => x.Difficulty.HasValue);

            RuleFor(x => x.MinDuration)
                .GreaterThan(0).WithMessage("Minimum duration must be greater than 0")
                .When(x => x.MinDuration.HasValue);

            RuleFor(x => x.MaxDuration)
                .GreaterThan(0).WithMessage("Maximum duration must be greater than 0")
                .GreaterThanOrEqualTo(x => x.MinDuration)
                .WithMessage("Maximum duration must be greater than or equal to minimum duration")
                .When(x => x.MaxDuration.HasValue);

            RuleFor(x => x.MinRating)
                .InclusiveBetween(0, 5).WithMessage("Minimum rating must be between 0 and 5")
                .When(x => x.MinRating.HasValue);

            RuleFor(x => x.SortBy)
                .Must(BeValidSortBy).WithMessage("Invalid sort by value")
                .When(x => !string.IsNullOrEmpty(x.SortBy));

            RuleFor(x => x.SortOrder)
                .Must(x => x == null || x.ToLower() == "asc" || x.ToLower() == "desc")
                .WithMessage("Sort order must be 'asc' or 'desc'");

            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");
        }

        private bool BeValidSortBy(string sortBy)
        {
            var validSortFields = new[] { "CreatedAt", "Title", "Rating", "Popularity", "Duration", "Updated" };
            return validSortFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
        }
    }

    public class RateLearningPathDtoValidator : AbstractValidator<RateLearningPathDto>
    {
        public RateLearningPathDtoValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");

            RuleFor(x => x.Review)
                .MaximumLength(1000).WithMessage("Review must not exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Review));

            RuleFor(x => x.Tags)
                .Must(HaveValidTags).WithMessage("Tags cannot contain empty values")
                .When(x => x.Tags != null);
        }

        private bool HaveValidTags(List<string> tags)
        {
            return tags.All(tag => !string.IsNullOrWhiteSpace(tag));
        }
    }

    public class EnrollInLearningPathDtoValidator : AbstractValidator<EnrollInLearningPathDto>
    {
        public EnrollInLearningPathDtoValidator()
        {
            RuleFor(x => x.LearningPathId)
                .NotEmpty().WithMessage("Learning path ID is required");
        }
    }
}
