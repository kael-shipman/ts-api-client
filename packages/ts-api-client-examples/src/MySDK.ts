import * as plumbing from "api-client-plumbing";
import {
  UserInterface,
  AddressInterface,
  OrderInterface,
} from "./Types";


export class MySDK {
  public users: plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>;
  public legalEntities: plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>;
  public orders: plumbing.Rest.JsonApi.ResourceRetriever<OrderInterface>;
  protected _oauthToken: string|null = null;

  constructor(
    protected apiKey: string,
    protected secret?: string|null,
    protected env: "uat"|"staging"|"prod"|"dev" = "prod",
    deps?: {
      queryAuthenticator?: plumbing.QueryAuthenticatorInterface;
      queryConstructor?: plumbing.Rest.JsonApi.QueryConstructor;
      queryResponseParser?: plumbing.Rest.JsonApi.QueryResponseParser;
    }
  ) {
    const subdomain = env === "prod" ? "" : `${env}.`;

    this.users = new plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>(
      "users",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      `https://${subdomain}my-api.com/v1`,
      deps
    );

    this.legalEntities = new plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>(
      "legal-entities",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      `https://${subdomain}my-api.com/v1`,
      deps
    );

    this.orders = new plumbing.Rest.JsonApi.ResourceRetriever<OrderInterface>(
      "orders",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      `https://${subdomain}my-api.com/v2`,
      deps
    );
  }

  set oauthToken(token: string|null) {
    this._oauthToken = token;
    this.users.oauthToken = token;
    this.legalEntities.oauthToken = token;
    this.orders.oauthToken = token;
  }
}
