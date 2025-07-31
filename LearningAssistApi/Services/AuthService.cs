using BCrypt.Net;
using LearningAssistApi.DTOs;
using LearningAssistApi.Models;
using LearningAssistApi.Repositories;
using System.Security.Cryptography;

namespace LearningAssistApi.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(string userId, string refreshToken);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<bool> VerifyEmailAsync(string token);
        Task<AuthResponseDto> SocialLoginAsync(SocialLoginDto socialLoginDto);
        Task<bool> RevokeRefreshTokenAsync(string userId, string refreshToken);
        Task<UserDto?> GetUserProfileAsync(string userId);
        Task<UserDto?> UpdateUserProfileAsync(string userId, UpdateProfileDto updateProfileDto);
        Task<bool> DeleteUserAccountAsync(string userId, string password);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;
        private const int MaxLoginAttempts = 5;
        private const int LockoutMinutes = 15;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if email already exists
                if (await _userRepository.IsEmailExistsAsync(registerDto.Email))
                {
                    throw new InvalidOperationException("Email already exists");
                }

                // Create new user
                var user = new User
                {
                    Email = registerDto.Email.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    PhoneNumber = registerDto.PhoneNumber,
                    DateOfBirth = registerDto.DateOfBirth ?? DateTime.MinValue,
                    Biography = registerDto.Biography,
                    PreferredLearningStyle = registerDto.PreferredLearningStyle,
                    CareerGoals = registerDto.CareerGoals,
                    Skills = registerDto.Skills,
                    Interests = registerDto.Interests,
                    PreferredDifficulty = registerDto.PreferredDifficulty,
                    PreferredStudyTime = registerDto.PreferredStudyTime,
                    EmailVerificationToken = GenerateSecureToken(),
                    EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
                };

                var createdUser = await _userRepository.InsertAsync(user);

                // Send verification email
                await _emailService.SendEmailVerificationAsync(createdUser.Email, createdUser.EmailVerificationToken!);

                // Generate tokens
                var accessToken = _jwtService.GenerateAccessToken(createdUser);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Store refresh token
                await _userRepository.AddRefreshTokenAsync(createdUser.Id.ToString(), refreshToken);

                _logger.LogInformation("User registered successfully: {Email}", registerDto.Email);

                return new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60), // Default expiry
                    User = MapToUserDto(createdUser)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration: {Email}", registerDto.Email);
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(loginDto.Email);
                
                if (user == null)
                {
                    throw new UnauthorizedAccessException("Invalid credentials");
                }

                // Check if user is locked
                if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
                {
                    throw new UnauthorizedAccessException($"Account is locked until {user.LockedUntil}");
                }

                // Check if user is active
                if (!user.IsActive)
                {
                    throw new UnauthorizedAccessException("Account is deactivated");
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    await _userRepository.IncrementLoginAttemptsAsync(user.Email);
                    
                    if (user.LoginAttempts + 1 >= MaxLoginAttempts)
                    {
                        await _userRepository.LockUserAsync(user.Email, DateTime.UtcNow.AddMinutes(LockoutMinutes));
                    }
                    
                    throw new UnauthorizedAccessException("Invalid credentials");
                }

                // Reset login attempts on successful login
                await _userRepository.ResetLoginAttemptsAsync(user.Email);
                await _userRepository.UpdateLastLoginAsync(user.Id.ToString());

                // Generate tokens
                var accessToken = _jwtService.GenerateAccessToken(user);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Store refresh token
                await _userRepository.AddRefreshTokenAsync(user.Id.ToString(), refreshToken);

                _logger.LogInformation("User logged in successfully: {Email}", loginDto.Email);

                return new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login: {Email}", loginDto.Email);
                throw;
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                // Find user with this refresh token
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.RefreshTokens.Contains(refreshToken));

                if (user == null)
                {
                    throw new UnauthorizedAccessException("Invalid refresh token");
                }

                // Remove old refresh token and generate new tokens
                await _userRepository.RemoveRefreshTokenAsync(user.Id.ToString(), refreshToken);

                var newAccessToken = _jwtService.GenerateAccessToken(user);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                await _userRepository.AddRefreshTokenAsync(user.Id.ToString(), newRefreshToken);

                return new AuthResponseDto
                {
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                throw;
            }
        }

        public async Task<bool> LogoutAsync(string userId, string refreshToken)
        {
            try
            {
                await _userRepository.RemoveRefreshTokenAsync(userId, refreshToken);
                _logger.LogInformation("User logged out successfully: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(forgotPasswordDto.Email);
                
                if (user != null)
                {
                    user.PasswordResetToken = GenerateSecureToken();
                    user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                    user.UpdatedAt = DateTime.UtcNow;

                    await _userRepository.UpdateAsync(user);
                    await _emailService.SendPasswordResetAsync(user.Email, user.PasswordResetToken);
                }

                // Always return true for security (don't reveal if email exists)
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during forgot password: {Email}", forgotPasswordDto.Email);
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
                
                if (user == null || user.Email.ToLower() != resetPasswordDto.Email.ToLower())
                {
                    return false;
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("Password reset successfully: {Email}", resetPasswordDto.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset: {Email}", resetPasswordDto.Email);
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                
                if (user == null)
                {
                    return false;
                }

                if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    return false;
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("Password changed successfully: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password change: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            try
            {
                var user = await _userRepository.GetByEmailVerificationTokenAsync(token);
                
                if (user == null)
                {
                    return false;
                }

                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("Email verified successfully: {Email}", user.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during email verification");
                return false;
            }
        }

        public async Task<AuthResponseDto> SocialLoginAsync(SocialLoginDto socialLoginDto)
        {
            // This is a placeholder implementation
            // In a real application, you would verify the social login token with the provider
            throw new NotImplementedException("Social login not implemented yet");
        }

        public async Task<bool> RevokeRefreshTokenAsync(string userId, string refreshToken)
        {
            return await _userRepository.RemoveRefreshTokenAsync(userId, refreshToken);
        }

        public async Task<UserDto?> GetUserProfileAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto?> UpdateUserProfileAsync(string userId, UpdateProfileDto updateProfileDto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                
                if (user == null)
                {
                    return null;
                }

                user.FirstName = updateProfileDto.FirstName;
                user.LastName = updateProfileDto.LastName;
                user.PhoneNumber = updateProfileDto.PhoneNumber;
                user.DateOfBirth = updateProfileDto.DateOfBirth ?? user.DateOfBirth;
                user.Biography = updateProfileDto.Biography;
                user.ProfilePictureUrl = updateProfileDto.ProfilePictureUrl;
                user.PreferredLearningStyle = updateProfileDto.PreferredLearningStyle;
                user.CareerGoals = updateProfileDto.CareerGoals;
                user.Skills = updateProfileDto.Skills;
                user.Interests = updateProfileDto.Interests;
                user.PreferredDifficulty = updateProfileDto.PreferredDifficulty;
                user.PreferredStudyTime = updateProfileDto.PreferredStudyTime;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("User profile updated successfully: {UserId}", userId);
                return MapToUserDto(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during profile update: {UserId}", userId);
                return null;
            }
        }

        public async Task<bool> DeleteUserAccountAsync(string userId, string password)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                
                if (user == null)
                {
                    return false;
                }

                if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    return false;
                }

                await _userRepository.SoftDeleteAsync(userId);
                
                _logger.LogInformation("User account deleted successfully: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during account deletion: {UserId}", userId);
                return false;
            }
        }

        private static string GenerateSecureToken()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth == DateTime.MinValue ? null : user.DateOfBirth,
                Biography = user.Biography,
                ProfilePictureUrl = user.ProfilePictureUrl,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                PreferredLearningStyle = user.PreferredLearningStyle,
                CareerGoals = user.CareerGoals,
                Skills = user.Skills,
                Interests = user.Interests,
                PreferredDifficulty = user.PreferredDifficulty,
                PreferredStudyTime = user.PreferredStudyTime
            };
        }
    }
}
