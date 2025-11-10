// Export all error classes
export {
  AppError,
  AuthenticationError,
  UnauthorizedError,
  SessionExpiredError,
  ValidationError,
  InvalidInputError,
  DatabaseError,
  RecordNotFoundError,
  DuplicateRecordError,
  NetworkError,
  TimeoutError,
  OfflineError,
  TaskError,
  TaskNotFoundError,
  TaskUpdateError,
  TaskDeleteError,
  TaskCreateError,
  RateLimitError,
  ServerError,
  ServiceUnavailableError,
  isAppError,
  isOperationalError,
} from './errors'

// Export error handler utilities
export {
  handleError,
  handleSupabaseError,
  handleNetworkError,
  withErrorHandling,
  withRetry,
  withTimeout,
  isOnline,
  safeAsync,
} from './errorHandler'

// Export Error Boundary component
export { ErrorBoundary, useErrorBoundary } from '@/components/ErrorBoundary'
