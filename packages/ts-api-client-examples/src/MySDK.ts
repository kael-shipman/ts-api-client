import * as plumbing from "api-client-plumbing";
import {
  UserInterface,
  AddressInterface,
  OrderInterface,
} from "./Types";
import { AdHocResourceRetriever } from "./AdHocResourceRetriever";
import { SimpleHttpClientRpn } from "simple-http-client-rpn";
import { SimpleHttpClientInterface } from "ts-simple-interfaces";


export class MySDK {
  public users: plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>;
  public legalEntities: plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>;
  public orders: AdHocResourceRetriever<OrderInterface>;
  protected _oauthToken: string|null = null;
  protected httpClient: SimpleHttpClientInterface;

  constructor(
    protected apiKey: string,
    protected secret?: string|null,
    protected env: "uat"|"staging"|"prod"|"dev" = "prod",
    deps?: {
      queryAuthenticator?: plumbing.QueryAuthenticatorInterface;
      queryConstructor?: plumbing.Rest.JsonApi.QueryConstructor;
      queryResponseParser?: plumbing.Rest.JsonApi.QueryResponseParser;
      httpClient?: SimpleHttpClientInterface;
    }
  ) {
    //const subdomain = env === "prod" ? "" : `${env}.`;

    if (deps && deps.httpClient) {
      this.httpClient = deps.httpClient;
    } else {
      this.httpClient = new SimpleHttpClientRpn();
    }

    this.users = new plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>(
      "users",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      //`https://${subdomain}my-api.com/v1`,
      `https://my-json-server.typicode.com/kael-shipman/ts-api-client`,
      this.httpClient,
      deps
    );

    this.legalEntities = new plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>(
      "legal-entities",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      //`https://${subdomain}my-api.com/v1`,
      `https://my-json-server.typicode.com/kael-shipman/ts-api-client`,
      this.httpClient,
      deps
    );

    this.orders = new AdHocResourceRetriever<OrderInterface>(
      "orders",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      //`https://${subdomain}my-api.com/v2`,
      `https://my-json-server.typicode.com/kael-shipman/ts-api-client`,
      this.httpClient,
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
