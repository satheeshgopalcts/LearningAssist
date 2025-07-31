namespace LearningAssistApi.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailVerificationAsync(string email, string token);
        Task<bool> SendPasswordResetAsync(string email, string token);
        Task<bool> SendWelcomeEmailAsync(string email, string firstName);
        Task<bool> SendEmailAsync(string to, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailVerificationAsync(string email, string token)
        {
            var subject = "Verify Your Email - Learning Assist";
            var verifyUrl = $"http://localhost:4200/auth/verify-email?token={token}";
            var body = $@"
                <h2>Welcome to Learning Assist!</h2>
                <p>Please click the link below to verify your email address:</p>
                <p><a href='{verifyUrl}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Verify Email</a></p>
                <p>If you didn't create an account, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
            ";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendPasswordResetAsync(string email, string token)
        {
            var subject = "Reset Your Password - Learning Assist";
            var resetUrl = $"http://localhost:4200/auth/reset-password?token={token}&email={email}";
            var body = $@"
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <p><a href='{resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            ";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string firstName)
        {
            var subject = "Welcome to Learning Assist!";
            var body = $@"
                <h2>Welcome {firstName}!</h2>
                <p>Thank you for joining Learning Assist. We're excited to help you on your learning journey.</p>
                <p>Here are some things you can do to get started:</p>
                <ul>
                    <li>Complete your profile setup</li>
                    <li>Browse our course catalog</li>
                    <li>Set your learning goals</li>
                    <li>Take your first assessment</li>
                </ul>
                <p>Happy learning!</p>
                <p>The Learning Assist Team</p>
            ";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                // This is a placeholder implementation
                // In a real application, you would use a service like SendGrid, AWS SES, or SMTP
                
                _logger.LogInformation("Sending email to {Email} with subject: {Subject}", to, subject);
                
                // Simulate email sending delay
                await Task.Delay(100);
                
                // For development, just log the email content
                _logger.LogInformation("Email content: {Body}", body);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
                return false;
            }
        }
    }
}
