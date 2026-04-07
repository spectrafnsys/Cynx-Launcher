import { ApiClient } from "../client/ApiClient";
import { API_ENDPOINTS } from "../client/config";
import { ApiResult } from "../../../app/types/client";

export class DiscordEndpoints {
  constructor(private client: ApiClient) {}

  async getCallback(): Promise<ApiResult<string>> {
    return this.client.get<string>(API_ENDPOINTS.DISCORD_CALLBACK);
  }
}
