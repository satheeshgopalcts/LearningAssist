using Xunit;
using FluentAssertions;
using LearningAssistApi.Services;
using LearningAssistApi.Repositories;
using LearningAssistApi.Models;
using LearningAssistApi.DTOs;
using Microsoft.Extensions.Logging;
using Moq;

namespace LearningAssistApi.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IJwtService> _jwtServiceMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _jwtServiceMock = new Mock<IJwtService>();
            _emailServiceMock = new Mock<IEmailService>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _authService = new AuthService(
                _userRepositoryMock.Object,
                _jwtServiceMock.Object,
                _emailServiceMock.Object,
                _loggerMock.Object
            );
        }

        [Fact]
        public async Task RegisterAsync_WithValidData_ShouldReturnAuthResponse()
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

            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = registerDto.Email.ToLower(),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PasswordHash = "hashedpassword",
                EmailVerificationToken = "token123"
            };

            _userRepositoryMock.Setup(x => x.IsEmailExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(false);
            
            _userRepositoryMock.Setup(x => x.InsertAsync(It.IsAny<User>()))
                .ReturnsAsync(user);

            _jwtServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>()))
                .Returns("access_token");

            _jwtServiceMock.Setup(x => x.GenerateRefreshToken())
                .Returns("refresh_token");

            _emailServiceMock.Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _userRepositoryMock.Setup(x => x.AddRefreshTokenAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _authService.RegisterAsync(registerDto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().Be("access_token");
            result.RefreshToken.Should().Be("refresh_token");
            result.User.Should().NotBeNull();
            result.User.Email.Should().Be(registerDto.Email.ToLower());
            result.User.FirstName.Should().Be(registerDto.FirstName);
            result.User.LastName.Should().Be(registerDto.LastName);

            _userRepositoryMock.Verify(x => x.IsEmailExistsAsync(registerDto.Email), Times.Once);
            _userRepositoryMock.Verify(x => x.InsertAsync(It.IsAny<User>()), Times.Once);
            _emailServiceMock.Verify(x => x.SendEmailVerificationAsync(user.Email, user.EmailVerificationToken), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_WithExistingEmail_ShouldThrowException()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "existing@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            _userRepositoryMock.Setup(x => x.IsEmailExistsAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _authService.RegisterAsync(registerDto));

            _userRepositoryMock.Verify(x => x.IsEmailExistsAsync(registerDto.Email), Times.Once);
            _userRepositoryMock.Verify(x => x.InsertAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnAuthResponse()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Test123!@#"
            };

            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = loginDto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(loginDto.Password),
                FirstName = "John",
                LastName = "Doe",
                IsActive = true,
                IsEmailVerified = true
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync(user);

            _jwtServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>()))
                .Returns("access_token");

            _jwtServiceMock.Setup(x => x.GenerateRefreshToken())
                .Returns("refresh_token");

            _userRepositoryMock.Setup(x => x.UpdateLastLoginAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _userRepositoryMock.Setup(x => x.AddRefreshTokenAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().Be("access_token");
            result.RefreshToken.Should().Be("refresh_token");
            result.User.Should().NotBeNull();
            result.User.Email.Should().Be(loginDto.Email.ToLower());

            _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
            _userRepositoryMock.Verify(x => x.UpdateLastLoginAsync(user.Id.ToString()), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidEmail_ShouldThrowException()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Test123!@#"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(loginDto));

            _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ShouldThrowException()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword"
            };

            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = loginDto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
                IsActive = true,
                IsEmailVerified = true
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(loginDto));

            _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
        }

        [Fact]
        public async Task ForgotPasswordAsync_WithValidEmail_ShouldReturnTrue()
        {
            // Arrange
            var forgotPasswordDto = new ForgotPasswordDto
            {
                Email = "test@example.com"
            };

            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = forgotPasswordDto.Email.ToLower(),
                FirstName = "John",
                LastName = "Doe"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync(user);

            _userRepositoryMock.Setup(x => x.UpdatePasswordResetTokenAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
                .Returns(Task.CompletedTask);

            _emailServiceMock.Setup(x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);

            // Assert
            result.Should().BeTrue();

            _userRepositoryMock.Verify(x => x.GetByEmailAsync(forgotPasswordDto.Email), Times.Once);
            _userRepositoryMock.Verify(x => x.UpdatePasswordResetTokenAsync(
                user.Id.ToString(), 
                It.IsAny<string>(), 
                It.IsAny<DateTime>()), Times.Once);
            _emailServiceMock.Verify(x => x.SendPasswordResetEmailAsync(user.Email, It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task ForgotPasswordAsync_WithInvalidEmail_ShouldReturnFalse()
        {
            // Arrange
            var forgotPasswordDto = new ForgotPasswordDto
            {
                Email = "nonexistent@example.com"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Act
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);

            // Assert
            result.Should().BeFalse();

            _userRepositoryMock.Verify(x => x.GetByEmailAsync(forgotPasswordDto.Email), Times.Once);
            _emailServiceMock.Verify(x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }
    }
}
