import {
  QueryData,
  QueryAuthenticatorInterface,
  ResourceRetrieverInterface,
  QueryBuilderInterface,
  QueryBuilder,
  Rest,
} from "api-client-plumbing";
import {
  SimpleHttpRequestConfig,
  SimpleHttpClientInterface,
} from "ts-simple-interfaces";
import { AdHocQueryResponseParser } from "./AdHocQueryResponseParser";

declare interface AdHocResource {[key: string]: any}

export class AdHocResourceRetriever<
  Resource extends AdHocResource
> implements ResourceRetrieverInterface<Resource> {
  protected queryBuilder: QueryBuilderInterface;
  protected queryAuthenticator: QueryAuthenticatorInterface;
  protected queryConstructor: Rest.JsonApi.QueryConstructor;
  protected queryResponseParser: AdHocQueryResponseParser;

  public constructor(
    protected resourceType: string,
    protected apiKey: string,
    protected secret: string|null,
    protected _oauthToken: string|null,
    protected baseUrl: string,
    protected httpClient: SimpleHttpClientInterface,
    deps?: {
      queryBuilder?: QueryBuilderInterface;
      queryAuthenticator?: QueryAuthenticatorInterface;
      queryConstructor?: Rest.JsonApi.QueryConstructor;
      queryResponseParser?: AdHocQueryResponseParser;
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
      this.queryAuthenticator = new Rest.BasicQueryAuthenticator(
        this.apiKey,
        this.secret,
        this._oauthToken,
      );
    }
    if (!this.queryConstructor) {
      this.queryConstructor = new Rest.JsonApi.QueryConstructor(this.baseUrl);
    }
    if (!this.queryResponseParser) {
      this.queryResponseParser = new AdHocQueryResponseParser();
    }
  }

  public get<R extends Resource|Array<Resource>>(): Promise<R> {
    const req = <SimpleHttpRequestConfig>this.queryAuthenticator.authenticate(
      this.queryConstructor.construct(this.value)
    );
    return this.httpClient.request<R>(req).then((res) => {
      return this.queryResponseParser.parse(res);
    });
  }

  set oauthToken(token: string|null) {
    this._oauthToken = token;

    // Have to sort of guess here, since this isn't guaranteed to exist
    if ((this.queryAuthenticator as any).oauthToken) {
      (this.queryAuthenticator as any).oauthToken = token;
    }
  }




  public withId(id: string|null): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.withId(id));
  }

  public filter(filter: string|null): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.filter(filter));
  }

  public include(include: string): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.include(include));
  }

  public sort(sort: string, dir: "asc"|"desc"): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.sort(sort, dir));
  }

  public pageNumber(pageNumber: number): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.pageNumber(pageNumber));
  }

  public pageSize(pageSize: number): ResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.pageSize(pageSize));
  }

  get value(): QueryData {
    return this.queryBuilder.value;
  }

  protected clone(builder: QueryBuilderInterface): ResourceRetrieverInterface<Resource> {
    return new AdHocResourceRetriever(
      this.resourceType,
      this.apiKey,
      this.secret,
      this._oauthToken,
      this.baseUrl,
      this.httpClient,
      {
        queryBuilder: builder,
        queryAuthenticator: this.queryAuthenticator,
        queryConstructor: this.queryConstructor,
        queryResponseParser: this.queryResponseParser,
      }
    );
  }
}

