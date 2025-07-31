using LearningAssistApi.Models;

namespace LearningAssistApi.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsEmailExistsAsync(string email);
        Task<User?> GetByEmailVerificationTokenAsync(string token);
        Task<User?> GetByPasswordResetTokenAsync(string token);
        Task<bool> UpdateLastLoginAsync(string userId);
        Task<bool> IncrementLoginAttemptsAsync(string email);
        Task<bool> ResetLoginAttemptsAsync(string email);
        Task<bool> LockUserAsync(string email, DateTime lockUntil);
        Task<bool> AddRefreshTokenAsync(string userId, string refreshToken);
        Task<bool> RemoveRefreshTokenAsync(string userId, string refreshToken);
        Task<bool> IsRefreshTokenValidAsync(string userId, string refreshToken);
        Task<List<User>> GetActiveUsersAsync();
        Task<bool> SoftDeleteAsync(string userId);
    }

    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(LiteDB.ILiteDatabase database) : base(database)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await FindOneAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await ExistsAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User?> GetByEmailVerificationTokenAsync(string token)
        {
            return await FindOneAsync(u => u.EmailVerificationToken == token && 
                                          u.EmailVerificationTokenExpiry > DateTime.UtcNow);
        }

        public async Task<User?> GetByPasswordResetTokenAsync(string token)
        {
            return await FindOneAsync(u => u.PasswordResetToken == token && 
                                          u.PasswordResetTokenExpiry > DateTime.UtcNow);
        }

        public async Task<bool> UpdateLastLoginAsync(string userId)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                user.LastLoginAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> IncrementLoginAttemptsAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            if (user != null)
            {
                user.LoginAttempts++;
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> ResetLoginAttemptsAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            if (user != null)
            {
                user.LoginAttempts = 0;
                user.LockedUntil = null;
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> LockUserAsync(string email, DateTime lockUntil)
        {
            var user = await GetByEmailAsync(email);
            if (user != null)
            {
                user.LockedUntil = lockUntil;
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> AddRefreshTokenAsync(string userId, string refreshToken)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                user.RefreshTokens.Add(refreshToken);
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> RemoveRefreshTokenAsync(string userId, string refreshToken)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                user.RefreshTokens.Remove(refreshToken);
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }

        public async Task<bool> IsRefreshTokenValidAsync(string userId, string refreshToken)
        {
            var user = await GetByIdAsync(userId);
            return user?.RefreshTokens.Contains(refreshToken) ?? false;
        }

        public async Task<List<User>> GetActiveUsersAsync()
        {
            return (await FindAsync(u => u.IsActive)).ToList();
        }

        public async Task<bool> SoftDeleteAsync(string userId)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;
                return await UpdateAsync(user);
            }
            return false;
        }
    }
}
