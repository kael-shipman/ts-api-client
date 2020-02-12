import {
  BasicQueryAuthenticatorInterface
} from "./Types";
import {
  SimpleHttpClientRequestConfig
} from "ts-simple-interfaces";
import { Base64 } from "js-base64";

/**
 * This class requires an API key on instantiation and accepts a secret and
 * an OAuth Token. It then uses these strings to compose the correct standard HTTP
 * Authorization headers (Basic and Bearer), REPLACING any auth headers that already exist.
 */
export class BasicQueryAuthenticator implements BasicQueryAuthenticatorInterface {
  public constructor(
    protected apiKey: string,
    protected secret?: string|null,
    protected _oauthToken?: string|null
  ) { }

  set oauthToken(token: string|null) {
    this._oauthToken = token;
  }

  authenticate(requestConfig: SimpleHttpClientRequestConfig): SimpleHttpClientRequestConfig {
    if (!requestConfig.headers) {
      requestConfig.headers = {};
    }
    for (let x in requestConfig.headers) {
      if (x.toLowerCase() === "authorization") {
        delete requestConfig.headers[x];
        break;
      }
    }
    requestConfig.headers.authorization = [
      "Basic " + Base64.encode(`${this.apiKey}:${this.secret}`)
    ];
    if (this._oauthToken) {
      requestConfig.headers.authorization.push(`Bearer ${this._oauthToken}`);
    }
    return requestConfig;
  }
}
