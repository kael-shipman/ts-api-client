import {
  QueryData,
  QueryAuthenticatorInterface,
  QueryBuilderInterface,
} from "../../Types";
import { ResourceRetrieverInterface, ResourceData, ResponseData, Document } from "./Types";
import { QueryBuilder } from "../../QueryBuilder";
import { BasicQueryAuthenticator } from "../BasicQueryAuthenticator";
import { QueryConstructor } from "./QueryConstructor";
import { QueryResponseParser } from "./QueryResponseParser";
import {
  SimpleHttpClientRequestConfig,
  SimpleHttpClientInterface,
  SimpleHttpClientResponseInterface,
} from "ts-simple-interfaces";

export class ResourceRetriever<Resource extends ResourceData<string>>
implements ResourceRetrieverInterface<Resource> {
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
    protected httpClient: SimpleHttpClientInterface,
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

  public get<R extends ResponseData<Resource["type"]>>(): Promise<Document<R>> {
    const req = <SimpleHttpClientRequestConfig>this.queryAuthenticator.authenticate(
      this.queryConstructor.construct(this.value)
    );
    return this.httpClient.request(req).then((res: SimpleHttpClientResponseInterface) => {
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
    return new ResourceRetriever<Resource>(
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
