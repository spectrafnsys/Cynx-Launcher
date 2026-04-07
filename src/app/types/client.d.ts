export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ApiConfig {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  details?: any;
}

export interface ExchangeCodeResponse {
  code: string;
}

export interface CreateExchangeCodeRequest {
  accountId: string;
}
