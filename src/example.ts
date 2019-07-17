import * as plumbing from "./";

declare interface UserInterface extends plumbing.Rest.JsonApi.ResourceInterface<"users"> {
  attributes: {
    name: string;
    email: string;
  }
}

declare interface LegalEntityInterface extends plumbing.Rest.JsonApi.ResourceInterface<"legal-entities"> {
  attributes: {
    legalId: string;
  }
}

declare interface OrderInterface extends plumbing.Rest.JsonApi.ResourceInterface<"orders"> {
  attributes: {
    price: number;
  }
}

class MySDK {
  public users: plumbing.Rest.JsonApi.ResourceRetriever<UserInterface>;
  public legalEntities: plumbing.Rest.JsonApi.ResourceRetriever<LegalEntityInterface>;
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

    this.legalEntities = new plumbing.Rest.JsonApi.ResourceRetriever<LegalEntityInterface>(
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







const api = new MySDK("abcde12345", "12345abcde");
let usersLikeJohn = api.users
.filter(JSON.stringify(["name", "like", "John %"]))
.include("personEntity")
.include("orders");


let n = 0;
const showUsersLikeJohn = function(q: plumbing.ResourceRetrieverInterface) {
  q.get()
  .then((user: UserInterface|false) => {
    console.log(user);
    if (user !== false && n < 10) {
      showUsersLikeJohn(q.pageNumber(n++));
    } else {
      console.log("No more users");
    }
  });
}
showUsersLikeJohn(usersLikeJohn);


