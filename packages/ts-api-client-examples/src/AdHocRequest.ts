import {
  SimpleHttpClientRequestConfig,
  SimpleHttpClientResponseInterface,
  SimpleHttpClientInterface,
} from "ts-simple-interfaces";
import {
  QueryData,
  QueryAuthenticatorInterface,
  ResourceRetrieverInterface,
  QueryBuilderInterface,
  QueryBuilder,
  Rest,
  QueryResponseParserInterface
} from "api-client-plumbing";

/**
 * Types
 */

// Simple ad-hoc resource definition
declare interface AdHocResource {[key: string]: any}

/**
 * **NOTE: IT IS EXTREMELY IMPORTANT FOR THE TYPECHECKER AND THE USE OF THE `isSuccess` TYPEGUARD
 * FUNCTION THAT WE DECLARE THIS UNION TYPE IN THIS WAY.** If we don't do this, neither `get` nor
 * `isSuccess` will function as expected.
 *
 * For anyone attempting to create a resource retriever interface, know that you must define the
 * success and failure return types as a single abstracted response type.
 */
declare type AdHocResponse<T extends AdHocResource | Array<AdHocResource>> =
  SimpleHttpClientResponseInterface<T> | SimpleHttpClientResponseInterface<{ error: string }>;

// In order for our return type to be as specific as we'd like, we have to create a custom
// ResourceRetrieverInterface for this API based on the base ResourceRetrieverInterface. All this
// does is specify the return type of the `get`, which otherwise would be hard-coded to `unknown`.
export interface AdHocResourceRetrieverInterface<T extends AdHocResource>
  extends ResourceRetrieverInterface<T> {
  withId: (id: string | null) => AdHocResourceRetrieverInterface<T>;
  filter: (query: unknown | null) => AdHocResourceRetrieverInterface<T>;
  include: (include: string) => AdHocResourceRetrieverInterface<T>;
  sort: (sort: string, dir?: "asc" | "desc") => AdHocResourceRetrieverInterface<T>;
  pageSize: (pageSize: number) => AdHocResourceRetrieverInterface<T>;
  pageNumber: (pageNumber: number) => AdHocResourceRetrieverInterface<T>;
  get: <U extends T | Array<T>>() => Promise<AdHocResponse<U>>;
}

export class AdHocQueryResponseParser implements QueryResponseParserInterface {
  parse<T extends any>(response: SimpleHttpClientResponseInterface<T>): T {
    if (typeof response.data === "string") {
      return JSON.parse(response.data);
    } else {
      return response.data;
    }
  }
}

export class AdHocResourceRetriever<
  Resource extends AdHocResource
> implements AdHocResourceRetrieverInterface<Resource> {
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

  /**
   * The definition and functioning of this method is very dependent on the API we're accessing.
   * In this example case, we're accessing a legacy API with very simple return types - either an
   * array of flat objects or a flat object in the success case, or a simple string error in the
   * failure case.
   *
   * Here, we do a little processing on the response using our custom query response processor.
   * This would allow us to create a generalized query response parser for all apis operating under
   * this specific success/failure response signature. In this way, we can (optionally) present
   * a legacy API as a modernized version, for example converting legacy responses into a newer
   * format before presenting to the final consumer.
   *
   * In this case, we're not converting - we're just parsing the response and returning it
   * literally.
   */
  public get<R extends Resource | Array<Resource>>(
  ): Promise<AdHocResponse<R>> {
    const req = <SimpleHttpClientRequestConfig>this.queryAuthenticator.authenticate(
      this.queryConstructor.construct(this.value)
    );
    return this.httpClient.request<R>(req).then((res) => {
      res.data = this.queryResponseParser.parse(res);
      return res;
    });
  }

  set oauthToken(token: string|null) {
    this._oauthToken = token;

    // Have to sort of guess here, since this isn't guaranteed to exist
    if ((this.queryAuthenticator as any).oauthToken) {
      (this.queryAuthenticator as any).oauthToken = token;
    }
  }




  public withId(id: string|null): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.withId(id));
  }

  public filter(filter: string|null): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.filter(filter));
  }

  public include(include: string): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.include(include));
  }

  public sort(sort: string, dir: "asc"|"desc"): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.sort(sort, dir));
  }

  public pageNumber(pageNumber: number): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.pageNumber(pageNumber));
  }

  public pageSize(pageSize: number): AdHocResourceRetrieverInterface<Resource> {
    return this.clone(this.queryBuilder.pageSize(pageSize));
  }

  get value(): QueryData {
    return this.queryBuilder.value;
  }

  protected clone(builder: QueryBuilderInterface): AdHocResourceRetrieverInterface<Resource> {
    return new AdHocResourceRetriever<Resource>(
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

export function isSuccess<R extends AdHocResource | Array<AdHocResource>>(
  r: AdHocResponse<R>
): r is SimpleHttpClientResponseInterface<R> {
  return typeof (r.data as any).error === "undefined";
}

