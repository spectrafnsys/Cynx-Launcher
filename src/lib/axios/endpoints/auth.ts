import { ApiClient } from "../client/ApiClient";
import { API_ENDPOINTS } from "../client/config";
import { validateSecret } from "../utils/validation";
import { ApiResult, ExchangeCodeResponse } from "../../../app/types/client";

export class AuthEndpoints {
  constructor(private client: ApiClient) {}

  async createExchangeCode(
    secret: string
  ): Promise<ApiResult<ExchangeCodeResponse>> {
    const validation = validateSecret(secret);
    if (!validation.isValid) {
      return {
        ok: false,
        error: validation.error,
      };
    }

    return this.client.post<ExchangeCodeResponse>(
      API_ENDPOINTS.AUTH_EXCHANGE_CREATE,
      { pulse: secret }
    );
  }

}
