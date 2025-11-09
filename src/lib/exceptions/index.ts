/**
 * Exception Handling System
 * 
 * This module provides a comprehensive error handling system for the Task Manager application.
 * 
 * @example
 * // Import error classes
 * import { TaskNotFoundError, ValidationError } from '@/lib/exceptions'
 * 
 * @example
 * // Use error handler
 * import { handleError, handleSupabaseError } from '@/lib/exceptions'
 * 
 * try {
 *   const { data, error } = await supabase.from('tasks').select('*')
 *   if (error) throw handleSupabaseError(error)
 * } catch (error) {
 *   handleError(error, 'Fetch Tasks')
 * }
 * 
 * @example
 * // Use with retry
 * import { withRetry } from '@/lib/exceptions'
 * 
 * const data = await withRetry(async () => {
 *   const { data, error } = await supabase.from('tasks').select('*')
 *   if (error) throw handleSupabaseError(error)
 *   return data
 * })
 */

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
