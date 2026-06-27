import toast from 'react-hot-toast'
import {
  AppError,
  AuthenticationError,
  SessionExpiredError,
  NetworkError,
  OfflineError,
  TimeoutError,
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
    toast.error(message)
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
