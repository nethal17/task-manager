import toast from 'react-hot-toast'
import {
  AppError,
  AuthenticationError,
  SessionExpiredError,
  NetworkError,
  OfflineError,
  TimeoutError,
  ValidationError,
  RateLimitError,
  isAppError,
  isOperationalError,
} from './errors'

interface ErrorHandlerConfig {
  showToast?: boolean
  logToConsole?: boolean
  redirectOnAuth?: boolean
  onError?: (error: Error) => void
}


const defaultConfig: ErrorHandlerConfig = {
  showToast: true,
  logToConsole: true,
  redirectOnAuth: false,
}

function getUserMessage(error: Error): string {

  if (isAppError(error)) {
    return error.message
  }

  const errorMessage = error.message.toLowerCase()

  if (errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }

  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  if (errorMessage.includes('network')) {
    return 'Network error. Please check your internet connection.'
  }

  if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
    return 'Your session has expired. Please sign in again.'
  }

  if (errorMessage.includes('not found')) {
    return 'The requested resource was not found.'
  }

  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return 'You do not have permission to perform this action.'
  }

  return 'An unexpected error occurred. Please try again.'
}


function logError(error: Error, context?: string) {
  const timestamp = new Date().toISOString()
  const prefix = context ? `[${context}]` : '[Error]'
  
  console.group(`${prefix} ${timestamp}`)
  console.error('Message:', error.message)
  console.error('Name:', error.name)
  
  if (isAppError(error)) {
    console.error('Status Code:', error.statusCode)
    console.error('Operational:', error.isOperational)
  }
  
  if (error.stack) {
    console.error('Stack:', error.stack)
  }
  
  console.groupEnd()
}

export function handleSupabaseError(error: any): AppError {
  const message = error?.message || 'Database operation failed'
  const code = error?.code

  // Auth errors
  if (code === 'PGRST301' || message.includes('JWT')) {
    return new SessionExpiredError()
  }

  if (code === '23505') {
    return new AppError('This record already exists', 409)
  }

  if (code === '23503') {
    return new AppError('Cannot delete: related records exist', 400)
  }

  if (code === 'PGRST116') {
    return new AppError('Record not found', 404)
  }

  // Row level security
  if (message.includes('row-level security')) {
    return new AppError('You do not have permission to perform this action', 403)
  }

  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return new NetworkError()
  }

  // Generic database error
  return new AppError(message, 500)
}


export function handleNetworkError(error: any): AppError {
  if (!navigator.onLine) {
    return new OfflineError()
  }

  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return new TimeoutError()
  }

  return new NetworkError()
}

export function handleError(
  error: unknown,
  context?: string,
  config: ErrorHandlerConfig = {}
): void {
  const finalConfig = { ...defaultConfig, ...config }
  
  let appError: Error

  // Convert unknown error to Error type
  if (error instanceof Error) {
    appError = error
  } else if (typeof error === 'string') {
    appError = new Error(error)
  } else {
    appError = new Error('An unknown error occurred')
  }

  // Log error if enabled
  if (finalConfig.logToConsole) {
    logError(appError, context)
  }

  // Show toast notification if enabled
  if (finalConfig.showToast) {
    const message = getUserMessage(appError)
    
    if (isAppError(appError)) {
      // Use appropriate toast type based on status code
      if (appError.statusCode >= 500) {
        toast.error(message)
      } else if (appError.statusCode === 401 || appError.statusCode === 403) {
        toast.error(message)
      } else if (appError.statusCode >= 400) {
        toast.error(message, { icon: '⚠️' })
      } else {
        toast.error(message)
      }
    } else {
      toast.error(message)
    }
  }

  // Call custom error handler if provided
  if (finalConfig.onError) {
    finalConfig.onError(appError)
  }

  // Handle authentication errors
  if (appError instanceof AuthenticationError || appError instanceof SessionExpiredError) {
    if (finalConfig.redirectOnAuth && typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  }
}

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string,
  config?: ErrorHandlerConfig
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context, config)
      throw error 
    }
  }) as T
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on operational errors (user errors)
      if (isOperationalError(lastError) && !(lastError instanceof NetworkError)) {
        throw lastError
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  timeoutMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(timeoutMessage))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
