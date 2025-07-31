# API Development Prompts

## Project Overview

**Project Name:** Learning Assist API Prompts  
**Technology Stack:** .NET Core 8, LiteDB  
**Purpose:** Documentation of user prompts and requests related to backend API development  
**Date Created:** July 31, 2025

---

## API Requirements Generation Session

**Date:** July 31, 2025  
**Context:** Backend API Planning for Angular E-Learning Application

### User Request:

```
Create a requirements-api.md file for backend api using .net core 8 and litedb to support the angular app
```

### Prompt Analysis:

**Key Requirements Identified:**
- .NET Core 8 as the backend framework
- LiteDB as the database solution
- RESTful API to support Angular frontend
- Integration with existing Angular e-learning application
- Comprehensive requirements documentation format

**Generated Output:**
- Complete API requirements document with 200+ checkboxed items
- 10 main modules covering all aspects of backend development
- Detailed acceptance criteria for each API endpoint
- Technical architecture and security requirements
- Performance, testing, and deployment specifications

### Implementation Strategy:

The prompt was interpreted to create a production-ready API requirements document covering:

1. **Core API Modules:**
   - User Management & Authentication API
   - Learning Content Management API
   - Progress Tracking & Analytics API
   - AI-Driven Recommendations API
   - Communication & Collaboration API

2. **Technical Architecture:**
   - .NET Core 8 framework utilization
   - LiteDB database design and optimization
   - JWT-based authentication system
   - RESTful API design principles
   - Security and performance considerations

3. **Development Standards:**
   - Comprehensive testing strategies
   - Code quality and coverage requirements
   - API documentation with Swagger/OpenAPI
   - Error handling and logging standards

4. **Production Readiness:**
   - Security requirements and best practices
   - Performance targets and scalability planning
   - Deployment and monitoring configurations
   - Risk assessment and mitigation strategies

### Key Decisions Made:

1. **Database Choice - LiteDB:**
   - **Rationale:** Lightweight, serverless, suitable for development and small-to-medium scale
   - **Benefits:** Easy setup, no external dependencies, good performance for typical e-learning scenarios
   - **Considerations:** Included migration path to full SQL database if scaling becomes necessary

2. **Authentication Strategy - JWT:**
   - **Rationale:** Stateless, scalable, compatible with Angular frontend
   - **Implementation:** Bearer token authentication with refresh token mechanism
   - **Security:** Proper token expiration, secure signing algorithms, token revocation support

3. **API Design - RESTful:**
   - **Rationale:** Industry standard, easy to consume from Angular
   - **Structure:** Resource-based URLs, proper HTTP methods, consistent response formats
   - **Features:** Pagination, filtering, sorting, error handling

4. **Module Structure:**
   - **Alignment:** Matches Angular frontend module structure for consistency
   - **Scalability:** Modular design allows independent development and deployment
   - **Maintainability:** Clear separation of concerns and responsibilities

### Technical Specifications Generated:

**API Endpoints:** 50+ endpoints across 5 main modules
**Database Collections:** 4 main collections with optimized schema design
**Security Features:** Encryption, validation, rate limiting, CORS configuration
**Testing Requirements:** Unit tests (80%+ coverage), integration tests, performance tests
**Documentation:** Swagger/OpenAPI integration, developer guides, troubleshooting

### Future Prompt Considerations:

**Development Phase Prompts:**
```
Generate the .NET Core 8 project structure and initial setup for the Learning Assist API with LiteDB integration
```

```
Create the User Management controller with JWT authentication implementation for the e-learning API
```

```
Implement the LiteDB repositories and data access layer for the Learning Assist API
```

**Architecture & Design Prompts:**
```
Design the database schema and collections structure for LiteDB in the e-learning application
```

```
Create middleware components for authentication, logging, and error handling in the .NET Core API
```

```
Implement the AI recommendation service integration points in the backend API
```

**Testing & Quality Prompts:**
```
Generate comprehensive unit tests for the User Management module using xUnit and Moq
```

```
Create integration tests for the Learning Content API endpoints with in-memory LiteDB
```

```
Implement performance testing scenarios for the backend API under load
```

**Deployment & DevOps Prompts:**
```
Create Docker containerization setup for the .NET Core API with LiteDB
```

```
Configure CI/CD pipeline for automated testing and deployment of the Learning Assist API
```

```
Set up monitoring, logging, and health checks for the production API environment
```

**Security & Compliance Prompts:**
```
Implement comprehensive input validation and sanitization for all API endpoints
```

```
Create security middleware for rate limiting, CORS, and request validation
```

```
Design data protection and GDPR compliance features for the user management system
```

**Integration Prompts:**
```
Create the API client service in Angular to consume the .NET Core backend endpoints
```

```
Implement real-time communication between Angular frontend and .NET Core API using SignalR
```

```
Design the data synchronization strategy between Angular app state and backend API
```

---

## Development Workflow Prompts

### Project Setup Prompts
```
Initialize .NET Core 8 Web API project with LiteDB dependencies and folder structure
Include: Project templates, NuGet packages, configuration files, development environment setup
```

### Database Design Prompts
```
Create LiteDB repository pattern implementation with generic CRUD operations
Include: Base repository interface, concrete implementations, unit of work pattern, data seeding
```

### Authentication Implementation Prompts
```
Build JWT authentication service with user registration, login, and token management
Include: Password hashing, token generation/validation, refresh tokens, role-based authorization
```

### API Development Prompts
```
Generate controller classes for each module with proper action methods and routing
Include: Model binding, validation attributes, response formatting, error handling
```

### Testing Strategy Prompts
```
Create comprehensive test suite covering unit tests, integration tests, and API tests
Include: Test data setup, mocking strategies, test automation, coverage reporting
```

### Documentation Prompts
```
Generate API documentation using Swagger/OpenAPI with detailed endpoint descriptions
Include: Request/response examples, authentication requirements, error codes, model schemas
```

---

## Code Generation Prompts

### Model Classes
```
Generate C# model classes for User, Course, Progress, and Assessment entities
Include: Data annotations, validation attributes, navigation properties, DTOs
```

### Service Layer
```
Create service classes implementing business logic for each major feature area
Include: Interface definitions, dependency injection setup, error handling, logging
```

### Data Access Layer
```
Implement LiteDB repositories with optimized queries and indexing strategies
Include: Generic repository pattern, unit of work, transaction handling, data seeding
```

### Middleware Components
```
Build custom middleware for cross-cutting concerns like logging, authentication, error handling
Include: Request/response logging, exception handling, performance monitoring, security headers
```

### Configuration Management
```
Set up configuration management for different environments with secure secret handling
Include: appsettings files, environment variables, Azure Key Vault integration, validation
```

---

## Integration & Deployment Prompts

### Angular Integration
```
Create TypeScript interfaces and services in Angular to match the .NET Core API contracts
Include: HTTP client services, error handling, authentication interceptors, state management
```

### Containerization
```
Create Docker setup for the .NET Core API with LiteDB data persistence
Include: Dockerfile, docker-compose, environment configuration, volume mounting
```

### CI/CD Pipeline
```
Set up automated build, test, and deployment pipeline for the API
Include: GitHub Actions/Azure DevOps, automated testing, deployment slots, rollback strategies
```

### Monitoring & Logging
```
Implement comprehensive logging and monitoring for production API
Include: Serilog configuration, Application Insights, health checks, performance counters
```

---

## Advanced Feature Prompts

### AI/ML Integration
```
Design integration points for AI/ML services in the recommendation engine
Include: External service calls, data preparation, model integration, result processing
```

### Caching Strategy
```
Implement multi-level caching for improved API performance
Include: In-memory caching, distributed caching, cache invalidation, cache warming
```

### Background Services
```
Create background services for data processing and automated tasks
Include: Hosted services, message queues, scheduled jobs, progress tracking
```

### Real-time Features
```
Implement SignalR for real-time communication between frontend and backend
Include: Hub configuration, connection management, group messaging, authentication
```

---

## Troubleshooting & Optimization Prompts

### Performance Optimization
```
Analyze and optimize API performance bottlenecks and database queries
Include: Profiling tools, query optimization, caching strategies, load testing
```

### Security Hardening
```
Implement advanced security features and vulnerability assessments
Include: Security headers, input validation, SQL injection prevention, rate limiting
```

### Error Handling
```
Create comprehensive error handling and logging strategies
Include: Global exception handling, custom exceptions, error reporting, user-friendly messages
```

### Scalability Planning
```
Design scalability improvements and load balancing strategies
Include: Horizontal scaling, database optimization, caching layers, CDN integration
```

---

## API Implementation Session

**Date:** July 31, 2025  
**Context:** Complete implementation of Learning Assist API with Module 1.1 User Registration & Authentication

### User Request 1:

```
create learning assist api and implement 1.1 User Registration & Authentication
```

### Implementation Overview:

**Project Structure Created:**
- Complete .NET Core 8 Web API project structure
- LiteDB integration with repository pattern
- JWT authentication implementation
- Module 1.1 fully implemented with all authentication features

**Key Files Implemented:**
1. **Program.cs** - Application bootstrap with:
   - JWT authentication configuration
   - CORS setup for Angular integration
   - Swagger/OpenAPI configuration
   - Dependency injection setup
   - Global exception middleware
   - Security headers implementation

2. **Controllers/AuthController.cs** - Complete authentication endpoints:
   - User registration with email verification
   - User login with JWT token generation
   - Password reset functionality
   - Profile management
   - Token refresh mechanism

3. **Services Layer:**
   - **JwtService.cs** - JWT token generation and validation
   - **AuthService.cs** - Business logic for authentication operations
   - **EmailService.cs** - Email notifications and verification

4. **Repository Layer:**
   - **IRepository.cs** - Generic repository interface
   - **UserRepository.cs** - User-specific data operations with LiteDB

5. **Models/User.cs** - User entity with comprehensive properties
6. **DTOs/** - Complete set of Data Transfer Objects for API contracts
7. **Validators/AuthValidators.cs** - FluentValidation rules for input validation

**Configuration Files:**
- **appsettings.json** - JWT settings, database connection, email configuration
- **appsettings.Development.json** - Development-specific settings
- **launchSettings.json** - Development server configuration

**Security Implementation:**
- BCrypt password hashing
- JWT tokens with refresh mechanism
- Input validation with FluentValidation
- CORS configuration for Angular frontend
- Security headers middleware
- Global exception handling

### User Request 2:

```
@agent Continue: "Continue to iterate?"
```

### Continuation Actions Taken:

1. **Program.cs Enhancement:**
   - Fixed JWT configuration section access
   - Added comprehensive middleware pipeline
   - Implemented global exception handling
   - Added health checks endpoint
   - Configured Swagger UI for API testing

2. **Validation Layer Addition:**
   - Created comprehensive FluentValidation validators
   - Password complexity requirements
   - Email format validation  
   - Age restrictions (13+ years)
   - Phone number format validation

3. **Development Environment Setup:**
   - Created Properties/launchSettings.json for multiple run profiles
   - Set up Data/ directory for LiteDB files
   - Added README.md with complete setup instructions
   - Created VS Code tasks for building and running

4. **Project Verification:**
   - Verified all dependencies are correctly configured
   - Ensured proper error handling throughout
   - Validated service registration in DI container
   - Checked file structure completeness

### User Request 3:

```
update prompts-api.md with latest user commands
```

### Prompt Documentation Strategy:

**Documentation Approach:**
- Real-time capture of user requests and implementation responses
- Technical decision justification and rationale
- Code generation patterns and best practices
- Troubleshooting and solution documentation

**Implementation Patterns Identified:**
1. **Incremental Development Pattern:**
   ```
   User Request → Analysis → Implementation → Verification → Documentation
   ```

2. **Error Resolution Pattern:**
   ```
   Error Detection → Root Cause Analysis → Solution Implementation → Testing
   ```

3. **Configuration Management Pattern:**
   ```
   Environment Setup → Security Configuration → Service Registration → Testing
   ```

### Technical Decisions Made:

**1. Program.cs Architecture:**
- **Choice:** Minimal hosting model with comprehensive middleware pipeline
- **Rationale:** Modern .NET approach with clear separation of concerns
- **Implementation:** Global exception middleware, security headers, CORS, JWT configuration

**2. Validation Strategy:**
- **Choice:** FluentValidation over Data Annotations
- **Rationale:** More flexible, testable, and maintainable validation logic
- **Implementation:** Separate validator classes with complex business rules

**3. Repository Pattern:**
- **Choice:** Generic repository with specific implementations
- **Rationale:** Abstraction over LiteDB with testability and maintainability
- **Implementation:** Interface-based design with dependency injection

**4. Security Implementation:**
- **Choice:** JWT with refresh tokens, BCrypt password hashing
- **Rationale:** Stateless authentication, secure password storage, scalable design
- **Implementation:** Comprehensive token management with proper validation

### Code Quality Measures Implemented:

**Error Handling:**
- Global exception middleware
- Consistent error response format
- Proper HTTP status codes
- Detailed logging integration

**Security:**
- Input validation at multiple layers
- Password complexity requirements
- JWT token validation
- CORS configuration for frontend integration
- Security headers implementation

**Maintainability:**
- Clean architecture with separation of concerns
- Dependency injection throughout
- Interface-based design
- Comprehensive documentation

### Development Workflow Established:

**1. Requirements Analysis:**
- Parse user requests for technical requirements
- Identify implementation patterns and dependencies
- Plan file structure and component interactions

**2. Implementation Strategy:**
- Create core infrastructure first (Program.cs, configuration)
- Implement data layer (models, repositories)
- Build business logic layer (services)
- Create API layer (controllers, DTOs)
- Add cross-cutting concerns (validation, logging)

**3. Verification Process:**
- Check for compilation errors
- Validate configuration completeness
- Ensure proper dependency registration
- Test endpoint functionality (when possible)

**4. Documentation Update:**
- Record user requests and context
- Document technical decisions and rationale
- Update requirements and implementation status
- Create setup and usage instructions

### Next Phase Considerations:

**Immediate Actions:**
1. Install .NET 8 SDK for local development
2. Test API endpoints using Swagger UI
3. Integrate with Angular frontend
4. Set up email service provider

**Future Development:**
1. Implement remaining API modules (Courses, Progress, etc.)
2. Add comprehensive unit and integration tests
3. Set up CI/CD pipeline
4. Deploy to cloud environment

**Monitoring & Maintenance:**
1. Set up application monitoring
2. Implement performance tracking
3. Create backup and recovery procedures
4. Plan for scalability improvements

---

## Latest Implementation Status

**✅ Completed Components:**
- Complete .NET Core 8 Web API project structure
- Module 1.1 User Registration & Authentication (100%)
- JWT authentication implementation
- LiteDB repository pattern
- Input validation with FluentValidation
- Email service infrastructure
- Swagger/OpenAPI documentation
- Development environment configuration
- Security middleware and headers
- Global exception handling

**🔄 In Progress:**
- Local development environment setup (.NET SDK installation needed)
- Email service provider configuration
- API endpoint testing and validation

**📋 Next Steps:**
- Complete remaining API modules (1.2-1.10)
- Angular frontend integration
- Comprehensive testing implementation
- Production deployment preparation

---

**Document Version:** 1.0  
**Last Updated:** July 31, 2025  
**Related Files:** requirements-api.md, prompts.md  
**Next Review:** August 7, 2025
