import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { DEFAULT_CONFIG } from "./config";
import { ApiConfig, ApiResult, ErrorResponse } from "../../../app/types/client";

export class ApiClient {
  private client: AxiosInstance;
  private config: Required<ApiConfig>;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.config.apiKey,
      },
    });

    instance.interceptors.request.use(
      (config) => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
          );
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `API Response: ${response.status} ${response.config.url}`
          );
        }
        return response;
      },
      (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error(
            `API Error: ${error.response?.status || "Network"} ${
              error.config?.url
            }`
          );
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    request: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retries
  ): Promise<ApiResult<T>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await request();
        return {
          ok: true,
          data: response.data,
          status: response.status,
        };
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;

        const shouldRetry =
          attempt < retries &&
          (!axiosError.response ||
            axiosError.response.status >= 500 ||
            axiosError.response.status === 429);

        if (!shouldRetry) {
          return this.handleError(axiosError);
        }

        const delay =
          this.config.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await this.sleep(delay);
      }
    }

    return {
      ok: false,
      error: "Max retries exceeded",
    };
  }

  private handleError(error: AxiosError<ErrorResponse>): ApiResult<never> {
    const responseData = error.response?.data;
    const status = error.response?.status;

    let errorMessage = "Request failed";

    if (responseData) {
      errorMessage = responseData.message || responseData.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (status === 401) {
      errorMessage = "Unauthorized - Invalid API key";
    } else if (status === 403) {
      errorMessage = "Forbidden - Access denied";
    } else if (status === 404) {
      errorMessage = "Not found";
    } else if (status === 429) {
      errorMessage = "Rate limit exceeded";
    } else if (status && status >= 500) {
      errorMessage = "Server error - Please try again later";
    }

    return {
      ok: false,
      error: errorMessage,
      status,
    };
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResult<T>> {
    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResult<T>> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config));
  }

  async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResult<T>> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config));
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResult<T>> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  async patch<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResult<T>> {
    return this.executeWithRetry(() => this.client.patch<T>(url, data, config));
  }

  async batchRequests<T>(
    requests: Array<() => Promise<ApiResult<T>>>
  ): Promise<ApiResult<T>[]> {
    try {
      return await Promise.all(requests.map((request) => request()));
    } catch (error) {
      return requests.map(() => ({
        ok: false,
        error: "Batch request failed",
      }));
    }
  }

  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client = this.createAxiosInstance();
  }

  getConfig(): Required<ApiConfig> {
    return { ...this.config };
  }
}
