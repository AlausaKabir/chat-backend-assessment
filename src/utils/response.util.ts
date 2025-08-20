export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(message: string, data: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static successWithoutData(message: string): ApiResponse {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(message: string, data: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static unauthorized(message: string = "Unauthorized"): ApiResponse {
    return {
      success: false,
      message,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }

  static notFound(message: string = "Resource not found"): ApiResponse {
    return {
      success: false,
      message,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }

  static badRequest(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString(),
    };
  }
}
