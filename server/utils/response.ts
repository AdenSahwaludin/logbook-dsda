export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export function sendSuccess<T>(event: any, message: string, data?: T, statusCode = 200): ApiResponse<T> {
  setResponseStatus(event, statusCode)
  return {
    success: true,
    message,
    data
  }
}

export function sendApiError(event: any, message: string, statusCode = 400, errors?: Record<string, string[]>): ApiResponse {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    message,
    errors
  }
}
