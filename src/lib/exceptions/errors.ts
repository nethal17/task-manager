/**
 * Custom Error Classes for Task Manager Application
 */

// Base Application Error
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// Authentication Errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 403)
  }
}

export class SessionExpiredError extends AppError {
  constructor(message: string = 'Your session has expired. Please sign in again.') {
    super(message, 401)
  }
}

// Validation Errors
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public fields?: Record<string, string>
  ) {
    super(message, 400)
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string = 'Invalid input provided') {
    super(message, 400)
  }
}

// Database Errors
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500)
  }
}

export class RecordNotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

export class DuplicateRecordError extends AppError {
  constructor(message: string = 'Record already exists') {
    super(message, 409)
  }
}

// Network Errors
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 503)
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out') {
    super(message, 408)
  }
}

export class OfflineError extends AppError {
  constructor(message: string = 'You appear to be offline. Please check your internet connection.') {
    super(message, 503)
  }
}

// Task-specific Errors
export class TaskError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode)
  }
}

export class TaskNotFoundError extends RecordNotFoundError {
  constructor() {
    super('Task')
  }
}

export class TaskUpdateError extends TaskError {
  constructor(message: string = 'Failed to update task') {
    super(message, 500)
  }
}

export class TaskDeleteError extends TaskError {
  constructor(message: string = 'Failed to delete task') {
    super(message, 500)
  }
}

export class TaskCreateError extends TaskError {
  constructor(message: string = 'Failed to create task') {
    super(message, 500)
  }
}

// Rate Limiting
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429)
  }
}

// Server Errors
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503)
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Type guard to check if error is operational (safe to show to user)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational
  }
  return false
}
