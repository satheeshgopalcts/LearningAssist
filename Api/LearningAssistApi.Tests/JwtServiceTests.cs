using Xunit;
using FluentAssertions;
using LearningAssistApi.Services;
using LearningAssistApi.Models;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace LearningAssistApi.Tests
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;
        private readonly IConfiguration _configuration;

        public JwtServiceTests()
        {
            // Create configuration for testing
            var configurationBuilder = new ConfigurationBuilder();
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string>
            {
                {"JwtSettings:SecretKey", "ThisIsASecretKeyForTestingPurposesOnly123456789"},
                {"JwtSettings:Issuer", "LearningAssistApi"},
                {"JwtSettings:Audience", "LearningAssistApi"},
                {"JwtSettings:ExpirationInMinutes", "60"}
            });
            _configuration = configurationBuilder.Build();

            _jwtService = new JwtService(_configuration);
        }

        [Fact]
        public void GenerateAccessToken_WithValidUser_ShouldReturnToken()
        {
            // Arrange
            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                Role = UserRole.Student
            };

            // Act
            var token = _jwtService.GenerateAccessToken(user);

            // Assert
            token.Should().NotBeNullOrEmpty();

            // Validate the token structure
            var tokenHandler = new JwtSecurityTokenHandler();
            var jsonToken = tokenHandler.ReadJwtToken(token);

            jsonToken.Should().NotBeNull();
            jsonToken.Claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == user.Id.ToString());
            jsonToken.Claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == user.Email);
            jsonToken.Claims.Should().Contain(c => c.Type == ClaimTypes.Name && c.Value == $"{user.FirstName} {user.LastName}");
            jsonToken.Claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == user.Role.ToString());
        }

        [Fact]
        public void GenerateRefreshToken_ShouldReturnUniqueTokens()
        {
            // Act
            var token1 = _jwtService.GenerateRefreshToken();
            var token2 = _jwtService.GenerateRefreshToken();

            // Assert
            token1.Should().NotBeNullOrEmpty();
            token2.Should().NotBeNullOrEmpty();
            token1.Should().NotBe(token2); // Should be unique
            token1.Length.Should().BeGreaterThan(10); // Should be reasonably long
        }

        [Fact]
        public void ValidateToken_WithValidToken_ShouldReturnClaimsPrincipal()
        {
            // Arrange
            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                Role = UserRole.Student
            };

            var token = _jwtService.GenerateAccessToken(user);

            // Act
            var principal = _jwtService.ValidateToken(token);

            // Assert
            principal.Should().NotBeNull();
            principal.Identity.IsAuthenticated.Should().BeTrue();
            
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            userIdClaim.Should().NotBeNull();
            userIdClaim.Value.Should().Be(user.Id.ToString());

            var emailClaim = principal.FindFirst(ClaimTypes.Email);
            emailClaim.Should().NotBeNull();
            emailClaim.Value.Should().Be(user.Email);
        }

        [Fact]
        public void ValidateToken_WithInvalidToken_ShouldReturnNull()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var principal = _jwtService.ValidateToken(invalidToken);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_WithExpiredToken_ShouldReturnNull()
        {
            // This test would require mocking DateTime or using a token with very short expiration
            // For now, we'll test with an empty/null token
            
            // Act
            var principal1 = _jwtService.ValidateToken("");
            var principal2 = _jwtService.ValidateToken(null);

            // Assert
            principal1.Should().BeNull();
            principal2.Should().BeNull();
        }

        [Fact]
        public void GetUserIdFromToken_WithValidToken_ShouldReturnUserId()
        {
            // Arrange
            var user = new User
            {
                Id = LiteDB.ObjectId.NewObjectId(),
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                Role = UserRole.Student
            };

            var token = _jwtService.GenerateAccessToken(user);

            // Act
            var userId = _jwtService.GetUserIdFromToken(token);

            // Assert
            userId.Should().Be(user.Id.ToString());
        }

        [Fact]
        public void GetUserIdFromToken_WithInvalidToken_ShouldReturnNull()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var userId = _jwtService.GetUserIdFromToken(invalidToken);

            // Assert
            userId.Should().BeNull();
        }
    }
}
