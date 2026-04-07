import { ApiClient } from "./client/ApiClient";
import { AuthEndpoints } from "./endpoints/auth";
import { DiscordEndpoints } from "./endpoints/discord";

export * from "./client/config";

export { ApiClient } from "./client/ApiClient";
export { AuthEndpoints } from "./endpoints/auth";
export { DiscordEndpoints } from "./endpoints/discord";

class PulseApiClient extends ApiClient {
  public readonly auth: AuthEndpoints;
  public readonly discord: DiscordEndpoints;

  constructor(config = {}) {
    super(config);
    this.auth = new AuthEndpoints(this);
    this.discord = new DiscordEndpoints(this);
  }
}

const api = new PulseApiClient();
export default api;

export { PulseApiClient };
