using Xunit;
using FluentAssertions;
using FluentValidation.TestHelper;
using LearningAssistApi.Validators;
using LearningAssistApi.DTOs;

namespace LearningAssistApi.Tests
{
    public class AuthValidatorTests
    {
        private readonly RegisterDtoValidator _registerValidator;
        private readonly LoginDtoValidator _loginValidator;
        private readonly ForgotPasswordDtoValidator _forgotPasswordValidator;
        private readonly ResetPasswordDtoValidator _resetPasswordValidator;
        private readonly ChangePasswordDtoValidator _changePasswordValidator;

        public AuthValidatorTests()
        {
            _registerValidator = new RegisterDtoValidator();
            _loginValidator = new LoginDtoValidator();
            _forgotPasswordValidator = new ForgotPasswordDtoValidator();
            _resetPasswordValidator = new ResetPasswordDtoValidator();
            _changePasswordValidator = new ChangePasswordDtoValidator();
        }

        [Fact]
        public void RegisterDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData("invalid-email")]
        [InlineData("@example.com")]
        [InlineData("test@")]
        public void RegisterDto_WithInvalidEmail_ShouldFailValidation(string email)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = email,
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Theory]
        [InlineData("")]
        [InlineData("123")]
        [InlineData("password")]
        [InlineData("PASSWORD")]
        [InlineData("Password")]
        [InlineData("Password123")]
        [InlineData("Password!@#")]
        [InlineData("123!@#")]
        public void RegisterDto_WithInvalidPassword_ShouldFailValidation(string password)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = password,
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Password);
        }

        [Theory]
        [InlineData("")]
        [InlineData("J")]
        [InlineData("John123")]
        [InlineData("John@")]
        public void RegisterDto_WithInvalidFirstName_ShouldFailValidation(string firstName)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = firstName,
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.FirstName);
        }

        [Theory]
        [InlineData("")]
        [InlineData("D")]
        [InlineData("Doe123")]
        [InlineData("Doe@")]
        public void RegisterDto_WithInvalidLastName_ShouldFailValidation(string lastName)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = lastName,
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.LastName);
        }

        [Fact]
        public void RegisterDto_WithTooYoungAge_ShouldFailValidation()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-10) // Too young
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.DateOfBirth);
        }

        [Fact]
        public void RegisterDto_WithFutureDateOfBirth_ShouldFailValidation()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(1) // Future date
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.DateOfBirth);
        }

        [Theory]
        [InlineData("+1234567890")]
        [InlineData("1234567890")]
        [InlineData("+12345678901234")]
        public void RegisterDto_WithValidPhoneNumber_ShouldPassValidation(string phoneNumber)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25),
                PhoneNumber = phoneNumber
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.PhoneNumber);
        }

        [Theory]
        [InlineData("123")]
        [InlineData("phone")]
        [InlineData("+")]
        [InlineData("0123456789")]
        public void RegisterDto_WithInvalidPhoneNumber_ShouldFailValidation(string phoneNumber)
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25),
                PhoneNumber = phoneNumber
            };

            // Act
            var result = _registerValidator.TestValidate(registerDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PhoneNumber);
        }

        [Fact]
        public void LoginDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Test123!@#"
            };

            // Act
            var result = _loginValidator.TestValidate(loginDto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData("invalid-email")]
        public void LoginDto_WithInvalidEmail_ShouldFailValidation(string email)
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = email,
                Password = "Test123!@#"
            };

            // Act
            var result = _loginValidator.TestValidate(loginDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void LoginDto_WithEmptyPassword_ShouldFailValidation(string password)
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = password
            };

            // Act
            var result = _loginValidator.TestValidate(loginDto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Password);
        }

        [Fact]
        public void ForgotPasswordDto_WithValidEmail_ShouldPassValidation()
        {
            // Arrange
            var dto = new ForgotPasswordDto
            {
                Email = "test@example.com"
            };

            // Act
            var result = _forgotPasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData("invalid-email")]
        public void ForgotPasswordDto_WithInvalidEmail_ShouldFailValidation(string email)
        {
            // Arrange
            var dto = new ForgotPasswordDto
            {
                Email = email
            };

            // Act
            var result = _forgotPasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void ResetPasswordDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var dto = new ResetPasswordDto
            {
                Token = "valid-token",
                NewPassword = "NewPassword123!@#"
            };

            // Act
            var result = _resetPasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void ResetPasswordDto_WithEmptyToken_ShouldFailValidation(string token)
        {
            // Arrange
            var dto = new ResetPasswordDto
            {
                Token = token,
                NewPassword = "NewPassword123!@#"
            };

            // Act
            var result = _resetPasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Token);
        }

        [Fact]
        public void ChangePasswordDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var dto = new ChangePasswordDto
            {
                CurrentPassword = "CurrentPassword123!@#",
                NewPassword = "NewPassword123!@#"
            };

            // Act
            var result = _changePasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void ChangePasswordDto_WithEmptyCurrentPassword_ShouldFailValidation(string currentPassword)
        {
            // Arrange
            var dto = new ChangePasswordDto
            {
                CurrentPassword = currentPassword,
                NewPassword = "NewPassword123!@#"
            };

            // Act
            var result = _changePasswordValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.CurrentPassword);
        }
    }
}
