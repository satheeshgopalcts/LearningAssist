import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  AuthRequest, 
  RegisterRequest, 
  AuthResponse, 
  PasswordResetRequest,
  UserRole 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // This will be replaced with actual backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'learning_assist_token';
  private refreshTokenKey = 'learning_assist_refresh_token';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on service initialization
    this.loadUserFromStorage();
  }

  /**
   * User Registration
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    // For demo purposes, we'll simulate the API call
    return this.simulateRegisterAPI(registerData).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * User Login
   */
  login(loginData: AuthRequest): Observable<AuthResponse> {
    // For demo purposes, we'll simulate the API call
    return this.simulateLoginAPI(loginData).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Social Login (Google/LinkedIn)
   */
  socialLogin(provider: 'google' | 'linkedin'): Observable<AuthResponse> {
    // This would integrate with actual social login providers
    return this.simulateSocialLoginAPI(provider).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Password Reset Request
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.simulateForgotPasswordAPI(email).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;
    
    // Check if token is expired (simplified check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user role
   */
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.simulateRefreshTokenAPI(refreshToken).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Private helper methods

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Simulation methods (to be replaced with actual HTTP calls)
  
  private simulateLoginAPI(loginData: AuthRequest): Observable<AuthResponse> {
    // Simulate API delay
    return of({
      token: this.generateMockToken(),
      refreshToken: this.generateMockRefreshToken(),
      user: {
        id: '1',
        email: loginData.email,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        isEmailVerified: true,
        careerGoals: [],
        learningPreferences: {
          learningStyle: 'visual' as any,
          preferredContentTypes: [],
          difficultyLevel: 'beginner' as any,
          studyTimePreference: 'flexible' as any,
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyProgress: true,
            courseUpdates: true,
            achievementAlerts: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      expiresIn: 3600
    }).pipe(
      map(response => {
        // Simulate validation
        if (loginData.password.length < 6) {
          throw new Error('Invalid credentials');
        }
        return response;
      })
    );
  }

  private simulateRegisterAPI(registerData: RegisterRequest): Observable<AuthResponse> {
    return of({
      token: this.generateMockToken(),
      refreshToken: this.generateMockRefreshToken(),
      user: {
        id: Date.now().toString(),
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: UserRole.STUDENT,
        isEmailVerified: false,
        careerGoals: [],
        learningPreferences: {
          learningStyle: 'visual' as any,
          preferredContentTypes: [],
          difficultyLevel: 'beginner' as any,
          studyTimePreference: 'flexible' as any,
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyProgress: true,
            courseUpdates: true,
            achievementAlerts: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      expiresIn: 3600
    }).pipe(
      map(response => {
        // Simulate validation
        if (registerData.password !== registerData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        return response;
      })
    );
  }

  private simulateSocialLoginAPI(provider: string): Observable<AuthResponse> {
    return of({
      token: this.generateMockToken(),
      refreshToken: this.generateMockRefreshToken(),
      user: {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User',
        role: UserRole.STUDENT,
        isEmailVerified: true,
        careerGoals: [],
        learningPreferences: {
          learningStyle: 'visual' as any,
          preferredContentTypes: [],
          difficultyLevel: 'beginner' as any,
          studyTimePreference: 'flexible' as any,
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyProgress: true,
            courseUpdates: true,
            achievementAlerts: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      expiresIn: 3600
    });
  }

  private simulateForgotPasswordAPI(email: string): Observable<{ message: string }> {
    return of({
      message: 'Password reset email sent successfully'
    });
  }

  private simulateRefreshTokenAPI(refreshToken: string): Observable<AuthResponse> {
    return of({
      token: this.generateMockToken(),
      refreshToken: this.generateMockRefreshToken(),
      user: this.getCurrentUser()!,
      expiresIn: 3600
    });
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: '1', 
      iat: Date.now() / 1000, 
      exp: (Date.now() / 1000) + 3600 
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  private generateMockRefreshToken(): string {
    return btoa(`refresh-${Date.now()}-${Math.random()}`);
  }
}
