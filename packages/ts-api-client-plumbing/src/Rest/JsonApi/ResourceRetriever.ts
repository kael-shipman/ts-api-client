import {
  QueryData,
  QueryAuthenticatorInterface,
  ResourceRetrieverInterface,
  QueryBuilderInterface,
} from "../../Types";
import { ResourceInterface } from "./Types";
import { QueryBuilder } from "../../QueryBuilder";
import { BasicQueryAuthenticator } from "../BasicQueryAuthenticator";
import { QueryConstructor } from "./QueryConstructor";
import { QueryResponseParser } from "./QueryResponseParser";
import { SimpleHttpRequestConfig } from "ts-simple-interfaces";

export class ResourceRetriever<Resource extends ResourceInterface<string>> implements ResourceRetrieverInterface {
  protected queryBuilder: QueryBuilderInterface;
  protected queryAuthenticator: QueryAuthenticatorInterface;
  protected queryConstructor: QueryConstructor;
  protected queryResponseParser: QueryResponseParser;

  public constructor(
    protected resourceType: string,
    protected apiKey: string,
    protected secret: string|null,
    protected _oauthToken: string|null,
    protected baseUrl: string,
    deps?: {
      queryBuilder?: QueryBuilderInterface;
      queryAuthenticator?: QueryAuthenticatorInterface;
      queryConstructor?: QueryConstructor;
      queryResponseParser?: QueryResponseParser;
    },
    d?: Partial<QueryData>,
  ) {
    // If we're injecting dependencies, use those
    if (deps) {
      if (deps.queryBuilder) {
        this.queryBuilder = deps.queryBuilder;
      }
      if (deps.queryAuthenticator) {
        this.queryAuthenticator = deps.queryAuthenticator;
      }
      if (deps.queryConstructor) {
        this.queryConstructor = deps.queryConstructor;
      }
      if (deps.queryResponseParser) {
        this.queryResponseParser = deps.queryResponseParser;
      }
    }

    // Otherwise, use defaults
    if (!this.queryBuilder) {
      this.queryBuilder = new QueryBuilder(this.resourceType);
    }
    if (!this.queryAuthenticator) {
      this.queryAuthenticator = new BasicQueryAuthenticator(
        this.apiKey,
        this.secret,
        this._oauthToken,
      );
    }
    if (!this.queryConstructor) {
      this.queryConstructor = new QueryConstructor(this.baseUrl);
    }
    if (!this.queryResponseParser) {
      this.queryResponseParser = new QueryResponseParser();
    }
  }

  public get(): Promise<Array<Resource>> {
    return new Promise((resolve, reject) => {
      const req = <SimpleHttpRequestConfig>this.queryAuthenticator.authenticate(
        this.queryConstructor.construct(this.value)
      );

      if (!req.baseURL) {
        console.log("No baseurl");
      }

      const page = this.value.pageNumber!;

      let resource: Resource;
      if (this.resourceType === "users") {
        resource = <Resource>{
          type: this.resourceType,
          id: "aaaaa",
          attributes: {
            name: "John Richard",
            email: "john.richard@gmail.com"
          },
          relationships: {
            address: {
              data: {
                type: "addresses",
                id: "abcde"
              }
            }
          }
        };
      } else if (this.resourceType === "orders") {
        resource = <Resource>{
          type: this.resourceType,
          id: "bbbbb",
          attributes: {
            quantity: 66,
            price: 1.50
          },
        };
      } else {
        return reject(`Unknown resource type ${this.resourceType}`);
      }

      const count = page === 2 ? 1 : (page > 3 ? 0 : this.value.pageSize!);
      const resources: Array<Resource> = [];
      for (let i = 0; i < count; i++) {
        resources.push(Object.assign({}, resource, { id: (page * this.value.pageSize!) + i*1 }));
      }

      resolve(resources);
    });
  }

  set oauthToken(token: string|null) {
    this._oauthToken = token;

    // Have to sort of guess here, since this isn't guaranteed to exist
    if ((this.queryAuthenticator as any).oauthToken) {
      (this.queryAuthenticator as any).oauthToken = token;
    }
  }




  public withId(id: string|null): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.withId(id));
  }

  public filter(filter: string|null): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.filter(filter));
  }

  public include(include: string): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.include(include));
  }

  public sort(sort: string, dir: "asc"|"desc"): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.sort(sort, dir));
  }

  public pageNumber(pageNumber: number): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.pageNumber(pageNumber));
  }

  public pageSize(pageSize: number): ResourceRetrieverInterface {
    return this.clone(this.queryBuilder.pageSize(pageSize));
  }

  get value(): QueryData {
    return this.queryBuilder.value;
  }

  protected clone(builder: QueryBuilderInterface): ResourceRetrieverInterface {
    return new ResourceRetriever(
      this.resourceType,
      this.apiKey,
      this.secret,
      this._oauthToken,
      this.baseUrl,
      {
        queryBuilder: builder,
        queryAuthenticator: this.queryAuthenticator,
        queryConstructor: this.queryConstructor,
        queryResponseParser: this.queryResponseParser,
      }
    );
  }
}
