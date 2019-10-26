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
  private _users: plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>;
  private _legalEntities: plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>;
  private _orders: AdHocResourceRetriever<OrderInterface>;
  protected _oauthToken: string|null = null;
  protected httpClient: SimpleHttpClientInterface;

  /**
   * Constructor
   *
   * @param apiKey The API Key for this collection of APIs
   * @param secret The optional secret associated with the API Key
   * @param env The environment to access
   * @param deps A dependency injector, which allows us to pass dependendencies down into our
   * child datasources
   */
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

    // We'll definitely need an HTTP Client, so if we haven't passed one as a dependency, we need
    // to instantiate one here.
    if (deps && deps.httpClient) {
      this.httpClient = deps.httpClient;
    } else {
      this.httpClient = new SimpleHttpClientRpn();
    }

    // Now instantiate each individual datasource

    this._users = new plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>(
      "users",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      //`https://${subdomain}my-api.com/v1`,
      `https://my-json-server.typicode.com/kael-shipman/ts-api-client`,
      this.httpClient,
      deps
    );

    this._legalEntities = new plumbing.Rest.JsonApi.ResourceRetriever<AddressInterface>(
      "legal-entities",
      this.apiKey,
      this.secret || null,
      this._oauthToken,
      //`https://${subdomain}my-api.com/v1`,
      `https://my-json-server.typicode.com/kael-shipman/ts-api-client`,
      this.httpClient,
      deps
    );

    this._orders = new AdHocResourceRetriever<OrderInterface>(
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

  // Since each datasource is independent, when we set an oauth token on the master context,
  // we have to propagate that to child datasources.
  set oauthToken(token: string|null) {
    this._oauthToken = token;
    this._users.oauthToken = token;
    this._legalEntities.oauthToken = token;
    this._orders.oauthToken = token;
  }

  get users() {
    return this._users;
  }
  get legalEntities() {
    return this._legalEntities;
  }
  get orders() {
    return this._orders;
  }
}
