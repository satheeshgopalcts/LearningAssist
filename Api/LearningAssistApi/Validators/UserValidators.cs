using FluentValidation;
using LearningAssistApi.DTOs;

namespace LearningAssistApi.Validators
{
    public class UpdateUserProfileDtoValidator : AbstractValidator<UpdateUserProfileDto>
    {
        public UpdateUserProfileDtoValidator()
        {
            When(x => !string.IsNullOrEmpty(x.FirstName), () => {
                RuleFor(x => x.FirstName)
                    .Length(2, 100)
                    .WithMessage("First name must be between 2 and 100 characters");
            });

            When(x => !string.IsNullOrEmpty(x.LastName), () => {
                RuleFor(x => x.LastName)
                    .Length(2, 100)
                    .WithMessage("Last name must be between 2 and 100 characters");
            });

            When(x => !string.IsNullOrEmpty(x.PhoneNumber), () => {
                RuleFor(x => x.PhoneNumber)
                    .Matches(@"^\+?[1-9]\d{1,14}$")
                    .WithMessage("Please provide a valid phone number");
            });

            When(x => !string.IsNullOrEmpty(x.ProfilePictureUrl), () => {
                RuleFor(x => x.ProfilePictureUrl)
                    .Must(BeAValidUrl)
                    .WithMessage("Please provide a valid URL for the profile picture");
            });

            When(x => !string.IsNullOrEmpty(x.Biography), () => {
                RuleFor(x => x.Biography)
                    .MaximumLength(1000)
                    .WithMessage("Biography cannot exceed 1000 characters");
            });

            RuleFor(x => x.DateOfBirth)
                .Must(BeAValidAge)
                .When(x => x.DateOfBirth.HasValue)
                .WithMessage("Date of birth must be between 13 and 120 years ago");

            When(x => x.CareerGoals != null, () => {
                RuleFor(x => x.CareerGoals!)
                    .Must(x => x.Count <= 10)
                    .WithMessage("Cannot have more than 10 career goals");
                
                RuleForEach(x => x.CareerGoals!)
                    .MaximumLength(100)
                    .WithMessage("Each career goal cannot exceed 100 characters");
            });

            When(x => x.Skills != null, () => {
                RuleFor(x => x.Skills!)
                    .Must(x => x.Count <= 20)
                    .WithMessage("Cannot have more than 20 skills");
                
                RuleForEach(x => x.Skills!)
                    .MaximumLength(50)
                    .WithMessage("Each skill cannot exceed 50 characters");
            });

            When(x => x.Interests != null, () => {
                RuleFor(x => x.Interests!)
                    .Must(x => x.Count <= 15)
                    .WithMessage("Cannot have more than 15 interests");
                
                RuleForEach(x => x.Interests!)
                    .MaximumLength(50)
                    .WithMessage("Each interest cannot exceed 50 characters");
            });
        }

        private bool BeAValidUrl(string? url)
        {
            return !string.IsNullOrEmpty(url) && Uri.TryCreate(url, UriKind.Absolute, out var result) 
                && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
        }

        private bool BeAValidAge(DateTime? dateOfBirth)
        {
            if (!dateOfBirth.HasValue) return true;
            
            var age = DateTime.UtcNow.Year - dateOfBirth.Value.Year;
            if (dateOfBirth.Value.Date > DateTime.UtcNow.AddYears(-age)) age--;
            
            return age >= 13 && age <= 120;
        }
    }

    public class UpdateUserPreferencesDtoValidator : AbstractValidator<UpdateUserPreferencesDto>
    {
        public UpdateUserPreferencesDtoValidator()
        {
            When(x => x.CareerGoals != null, () => {
                RuleFor(x => x.CareerGoals!)
                    .Must(x => x.Count <= 10)
                    .WithMessage("Cannot have more than 10 career goals");
                
                RuleForEach(x => x.CareerGoals!)
                    .MaximumLength(100)
                    .WithMessage("Each career goal cannot exceed 100 characters");
            });

            When(x => x.Skills != null, () => {
                RuleFor(x => x.Skills!)
                    .Must(x => x.Count <= 20)
                    .WithMessage("Cannot have more than 20 skills");
                
                RuleForEach(x => x.Skills!)
                    .MaximumLength(50)
                    .WithMessage("Each skill cannot exceed 50 characters");
            });

            When(x => x.Interests != null, () => {
                RuleFor(x => x.Interests!)
                    .Must(x => x.Count <= 15)
                    .WithMessage("Cannot have more than 15 interests");
                
                RuleForEach(x => x.Interests!)
                    .MaximumLength(50)
                    .WithMessage("Each interest cannot exceed 50 characters");
            });
        }
    }

    public class DeleteAccountDtoValidator : AbstractValidator<DeleteAccountDto>
    {
        public DeleteAccountDtoValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty()
                .WithMessage("Current password is required");

            RuleFor(x => x.ConfirmDeletion)
                .Equal(true)
                .WithMessage("You must confirm account deletion");

            When(x => !string.IsNullOrEmpty(x.Reason), () => {
                RuleFor(x => x.Reason)
                    .MaximumLength(500)
                    .WithMessage("Reason cannot exceed 500 characters");
            });
        }
    }
}
