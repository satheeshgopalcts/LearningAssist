# Learning Assist API

AI-driven adaptive learning platform backend API built with .NET Core 8 and LiteDB.

## Overview

This is the backend API for the Learning Assist platform, providing user authentication, course management, AI-driven adaptive learning features, and comprehensive analytics.

## Technology Stack

- **.NET Core 8**: Modern, cross-platform framework
- **LiteDB**: Lightweight, embedded NoSQL database
- **JWT Authentication**: Secure token-based authentication
- **Swagger/OpenAPI**: API documentation and testing
- **Serilog**: Structured logging
- **FluentValidation**: Input validation
- **BCrypt**: Password hashing

## Features Implemented

### Module 1.1: User Registration & Authentication ✅

- **User Registration**: Complete registration with email verification
- **User Login**: JWT-based authentication with refresh tokens
- **Password Management**: Forgot password, reset password, change password
- **Email Verification**: Account activation via email
- **Social Login**: Support for Google, Facebook, Microsoft (configured but needs provider setup)
- **Profile Management**: User profile CRUD operations
- **Account Management**: Account deletion with verification

## Project Structure

```
LearningAssistApi/
├── Controllers/           # API Controllers
│   └── AuthController.cs  # Authentication endpoints
├── DTOs/                  # Data Transfer Objects
│   ├── AuthDTOs.cs       # Authentication DTOs
│   └── ResponseDTOs.cs   # Response wrapper DTOs
├── Models/               # Domain Models
│   └── User.cs          # User entity
├── Repositories/        # Data Access Layer
│   ├── IRepository.cs   # Generic repository interface
│   └── UserRepository.cs # User-specific repository
├── Services/            # Business Logic Layer
│   ├── IJwtService.cs & JwtService.cs      # JWT token management
│   ├── IAuthService.cs & AuthService.cs   # Authentication logic
│   └── IEmailService.cs & EmailService.cs # Email services
├── Validators/          # Input Validation
│   └── AuthValidators.cs # FluentValidation validators
├── Data/               # Database files (LiteDB)
├── Properties/         # Launch settings
├── appsettings.json    # Configuration
└── Program.cs         # Application bootstrap
```

## Configuration

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "Your-Secret-Key-Here",
    "Issuer": "LearningAssistApi",
    "Audience": "LearningAssistApp",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  }
}
```

### Email Settings (appsettings.json)
```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "noreply@learningassist.com",
    "FromName": "Learning Assist"
  }
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/social-login` | Social media login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| DELETE | `/api/auth/account` | Delete user account |

## Setup and Installation

### Prerequisites

1. **.NET 8 SDK**: Download from [Microsoft .NET](https://dotnet.microsoft.com/download)
2. **Git**: For version control
3. **Visual Studio Code** or **Visual Studio**: IDE/Editor

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LearningAssist/LearningAssistApi
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update configuration**
   - Update `appsettings.json` with your email settings
   - Generate a secure JWT secret key (min 32 characters)

4. **Build the project**
   ```bash
   dotnet build
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access Swagger UI**
   - Navigate to `https://localhost:5001` or `http://localhost:5000`
   - Swagger UI will be available at the root URL

## Development

### Running in Development Mode

```bash
dotnet watch run
```

This will automatically restart the server when code changes are detected.

### Database

The application uses LiteDB, which creates a file-based database in the `Data/` directory. No additional database setup is required.

### Testing the API

1. **Using Swagger UI**: Navigate to the root URL when running the application
2. **Using Postman**: Import the API endpoints and test manually
3. **Using curl**: Command-line testing

Example registration request:
```bash
curl -X POST "https://localhost:5001/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!",
       "firstName": "John",
       "lastName": "Doe",
       "dateOfBirth": "1990-01-01"
     }'
```

## Security Features

- **Password Hashing**: BCrypt with salt
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Long-lived tokens for seamless user experience
- **Input Validation**: Comprehensive validation using FluentValidation
- **CORS Configuration**: Configured for Angular frontend
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.
- **HTTPS Redirection**: Force HTTPS in production

## Logging

The application uses Serilog for structured logging:
- Console logging for development
- File logging with daily rotation
- Configurable log levels

Log files are stored in the `logs/` directory.

## Error Handling

Global exception middleware handles all uncaught exceptions and returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error details"
}
```

## Next Steps

1. **Install .NET 8 SDK** on your machine
2. **Configure email settings** in appsettings.json
3. **Run the application** using `dotnet run`
4. **Test the endpoints** using Swagger UI
5. **Integrate with Angular frontend**

## Support

For questions or issues, please refer to the requirements-api.md file or contact the development team.
