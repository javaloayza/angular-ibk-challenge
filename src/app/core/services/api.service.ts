import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  
  private readonly config: ApiConfig = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    retryAttempts: 2
  };

  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.get<T>(`${this.config.baseUrl}${endpoint}`, {
      headers: options?.headers || this.defaultHeaders
    }).pipe(
      retry(this.config.retryAttempts || 2),
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.post<T>(`${this.config.baseUrl}${endpoint}`, data, {
      headers: options?.headers || this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.put<T>(`${this.config.baseUrl}${endpoint}`, data, {
      headers: options?.headers || this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.delete<T>(`${this.config.baseUrl}${endpoint}`, {
      headers: options?.headers || this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.patch<T>(`${this.config.baseUrl}${endpoint}`, data, {
      headers: options?.headers || this.defaultHeaders
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Please check your input';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission';
          break;
        case 404:
          errorMessage = 'Not Found: Resource does not exist';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        default:
          errorMessage = `Server Error (${error.status}): ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Update base URL (useful for different environments)
   */
  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}