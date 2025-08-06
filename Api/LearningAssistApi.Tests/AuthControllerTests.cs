using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using LearningAssistApi.DTOs;

namespace LearningAssistApi.Tests
{
    public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public AuthControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Register_WithValidData_ShouldReturnSuccess()
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

            var json = JsonSerializer.Serialize(registerDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ApiResponseDto<AuthResponseDto>>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data.Token.Should().NotBeNullOrEmpty();
            result.Data.User.Should().NotBeNull();
            result.Data.User.Email.Should().Be(registerDto.Email.ToLower());
        }

        [Fact]
        public async Task Register_WithInvalidEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "invalid-email",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var json = JsonSerializer.Serialize(registerDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithWeakPassword_ShouldReturnBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "weak",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var json = JsonSerializer.Serialize(registerDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithDuplicateEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Email = "duplicate@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var json = JsonSerializer.Serialize(registerDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act - First registration
            var firstResponse = await _client.PostAsync("/api/auth/register", content);
            firstResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);

            // Act - Second registration with same email
            var secondResponse = await _client.PostAsync("/api/auth/register", content);

            // Assert
            secondResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnSuccess()
        {
            // Arrange - First register a user
            var registerDto = new RegisterDto
            {
                Email = "login@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var registerJson = JsonSerializer.Serialize(registerDto);
            var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
            await _client.PostAsync("/api/auth/register", registerContent);

            var loginDto = new LoginDto
            {
                Email = "login@example.com",
                Password = "Test123!@#"
            };

            var loginJson = JsonSerializer.Serialize(loginDto);
            var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", loginContent);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ApiResponseDto<AuthResponseDto>>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data.Token.Should().NotBeNullOrEmpty();
            result.Data.User.Should().NotBeNull();
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "WrongPassword123!@#"
            };

            var json = JsonSerializer.Serialize(loginDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithInvalidEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "invalid-email",
                Password = "Test123!@#"
            };

            var json = JsonSerializer.Serialize(loginDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task ForgotPassword_WithValidEmail_ShouldReturnSuccess()
        {
            // Arrange - First register a user
            var registerDto = new RegisterDto
            {
                Email = "forgot@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var registerJson = JsonSerializer.Serialize(registerDto);
            var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
            await _client.PostAsync("/api/auth/register", registerContent);

            var forgotPasswordDto = new ForgotPasswordDto
            {
                Email = "forgot@example.com"
            };

            var json = JsonSerializer.Serialize(forgotPasswordDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/forgot-password", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        }

        [Fact]
        public async Task ForgotPassword_WithInvalidEmail_ShouldReturnNotFound()
        {
            // Arrange
            var forgotPasswordDto = new ForgotPasswordDto
            {
                Email = "nonexistent@example.com"
            };

            var json = JsonSerializer.Serialize(forgotPasswordDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/forgot-password", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task RefreshToken_WithValidToken_ShouldReturnNewToken()
        {
            // Arrange - First register and login to get tokens
            var registerDto = new RegisterDto
            {
                Email = "refresh@example.com",
                Password = "Test123!@#",
                FirstName = "John",
                LastName = "Doe",
                DateOfBirth = DateTime.Now.AddYears(-25)
            };

            var registerJson = JsonSerializer.Serialize(registerDto);
            var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");
            await _client.PostAsync("/api/auth/register", registerContent);

            var loginDto = new LoginDto
            {
                Email = "refresh@example.com",
                Password = "Test123!@#"
            };

            var loginJson = JsonSerializer.Serialize(loginDto);
            var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");
            var loginResponse = await _client.PostAsync("/api/auth/login", loginContent);
            
            var loginResponseString = await loginResponse.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<ApiResponseDto<AuthResponseDto>>(loginResponseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            var refreshTokenDto = new RefreshTokenDto
            {
                RefreshToken = loginResult.Data.RefreshToken
            };

            var refreshJson = JsonSerializer.Serialize(refreshTokenDto);
            var refreshContent = new StringContent(refreshJson, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/refresh-token", refreshContent);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ApiResponseDto<AuthResponseDto>>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data.Token.Should().NotBeNullOrEmpty();
            result.Data.Token.Should().NotBe(loginResult.Data.Token); // Should be a new token
        }
    }
}
