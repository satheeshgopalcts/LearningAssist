using FluentValidation;
using LearningAssistApi.DTOs;

namespace LearningAssistApi.Validators
{
    public class CreateCourseDtoValidator : AbstractValidator<CreateCourseDto>
    {
        public CreateCourseDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Course title is required")
                .Length(2, 200)
                .WithMessage("Course title must be between 2 and 200 characters");

            RuleFor(x => x.Description)
                .NotEmpty()
                .WithMessage("Course description is required")
                .Length(10, 2000)
                .WithMessage("Course description must be between 10 and 2000 characters");

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500)
                .WithMessage("Short description cannot exceed 500 characters");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Price must be non-negative")
                .LessThanOrEqualTo(10000)
                .WithMessage("Price cannot exceed 10,000");

            RuleFor(x => x.Currency)
                .NotEmpty()
                .WithMessage("Currency is required")
                .Length(3)
                .WithMessage("Currency must be a 3-letter code (e.g., USD)");

            RuleFor(x => x.ThumbnailUrl)
                .Must(BeValidUrl)
                .WithMessage("Thumbnail URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.ThumbnailUrl));

            RuleFor(x => x.PreviewVideoUrl)
                .Must(BeValidUrl)
                .WithMessage("Preview video URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.PreviewVideoUrl));

            RuleFor(x => x.Categories)
                .Must(x => x.Count <= 5)
                .WithMessage("A course can have at most 5 categories");

            RuleFor(x => x.Tags)
                .Must(x => x.Count <= 10)
                .WithMessage("A course can have at most 10 tags");

            RuleFor(x => x.EstimatedDurationMinutes)
                .GreaterThan(0)
                .WithMessage("Estimated duration must be greater than 0")
                .When(x => x.EstimatedDurationMinutes > 0);

            RuleFor(x => x.MaxEnrollments)
                .GreaterThan(0)
                .WithMessage("Max enrollments must be greater than 0")
                .When(x => x.MaxEnrollments > 0);
        }

        private static bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return true;
            
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }

    public class UpdateCourseDtoValidator : AbstractValidator<UpdateCourseDto>
    {
        public UpdateCourseDtoValidator()
        {
            RuleFor(x => x.Title)
                .Length(2, 200)
                .WithMessage("Course title must be between 2 and 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Title));

            RuleFor(x => x.Description)
                .Length(10, 2000)
                .WithMessage("Course description must be between 10 and 2000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500)
                .WithMessage("Short description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.ShortDescription));

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Price must be non-negative")
                .LessThanOrEqualTo(10000)
                .WithMessage("Price cannot exceed 10,000")
                .When(x => x.Price.HasValue);

            RuleFor(x => x.Currency)
                .Length(3)
                .WithMessage("Currency must be a 3-letter code (e.g., USD)")
                .When(x => !string.IsNullOrEmpty(x.Currency));

            RuleFor(x => x.ThumbnailUrl)
                .Must(BeValidUrl)
                .WithMessage("Thumbnail URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.ThumbnailUrl));

            RuleFor(x => x.PreviewVideoUrl)
                .Must(BeValidUrl)
                .WithMessage("Preview video URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.PreviewVideoUrl));

            RuleFor(x => x.Categories)
                .Must(x => x!.Count <= 5)
                .WithMessage("A course can have at most 5 categories")
                .When(x => x.Categories != null);

            RuleFor(x => x.Tags)
                .Must(x => x!.Count <= 10)
                .WithMessage("A course can have at most 10 tags")
                .When(x => x.Tags != null);

            RuleFor(x => x.EstimatedDurationMinutes)
                .GreaterThan(0)
                .WithMessage("Estimated duration must be greater than 0")
                .When(x => x.EstimatedDurationMinutes.HasValue && x.EstimatedDurationMinutes > 0);

            RuleFor(x => x.MaxEnrollments)
                .GreaterThan(0)
                .WithMessage("Max enrollments must be greater than 0")
                .When(x => x.MaxEnrollments.HasValue && x.MaxEnrollments > 0);
        }

        private static bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return true;
            
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }

    public class UpdateProgressDtoValidator : AbstractValidator<UpdateProgressDto>
    {
        public UpdateProgressDtoValidator()
        {
            RuleFor(x => x.ModuleId)
                .NotEmpty()
                .WithMessage("Module ID is required");

            RuleFor(x => x.TimeSpentMinutes)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Time spent must be non-negative");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage("Progress percentage must be between 0 and 100");
        }
    }

    public class RateCourseDtoValidator : AbstractValidator<RateCourseDto>
    {
        public RateCourseDtoValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating must be between 1 and 5 stars");

            RuleFor(x => x.Review)
                .MaximumLength(1000)
                .WithMessage("Review cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Review));

            RuleFor(x => x.Tags)
                .Must(x => x.Count <= 5)
                .WithMessage("A rating can have at most 5 tags");
        }
    }
}
