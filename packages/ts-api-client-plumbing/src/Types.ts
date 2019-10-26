/**
 * QueryExecutorInterface uses QueryData to compose a query, send it to a datasource, and
 * retrieve a result.
 *
 * Implicit in this is the need to a) Build the query (see `QueryBuilderInterface`); b) Format
 * the query correctly (see `QueryConstructorInterface`); c) authenticate the query (see
 * `QueryAuthenticatorInterface`); d) address the datasource correctly; and e) parse the query
 * response (see `QueryResponseParserInterface`).
 *
 * In most concrete implementations, all this is expected to be accomplished by composing the
 * various components using default concrete implementations with optional injected overrides.
 * These concrete implementations are expected to implement interfaces that are derivatives
 * of the very general top-level interfaces mentioned here, such that they further specify
 * input parameters and output types.
 */

export interface ResourceRetrieverInterface<T extends unknown> extends QueryBuilderInterface {
  withId: (id: string|null) =>  ResourceRetrieverInterface<T>;
  filter: (query: unknown|null) =>  ResourceRetrieverInterface<T>;
  include: (include: string) =>  ResourceRetrieverInterface<T>;
  sort: (sort: string, dir?: "asc"|"desc") =>  ResourceRetrieverInterface<T>;
  pageSize: (pageSize: number) =>  ResourceRetrieverInterface<T>;
  pageNumber: (pageNumber: number) =>  ResourceRetrieverInterface<T>;
  get: <U extends T|Array<T>>() => Promise<unknown>;
}


/**
 * QueryBuilderInterface defines a query builder that supports all the trappings of a
 * modern query system -- `withId` is used to get a resource by id; `filter` is used to filter
 * the resources set; `include` is used to include related resources; `sort` to order the set; 
 * `pageSize` to set the maximum number of results to be returned; and `pageNumber` to specify
 * the offset of results to return.
 *
 * Pagination in particular is a weak point in this schema, since there is currently some
 * disagreement about what the best pagination technique is. This is to be revisited later....
 *
 * A `QueryBuilder` should produce a value which is `QueryData`. It is recommended that
 * concrete implementations consider enforcing immutability and instead return clones,
 * such that a given query may be saved and branched (for example, to get further pages).
 */
export interface  QueryBuilderInterface {
  readonly value: QueryData;
  withId: (id: string|null) =>  QueryBuilderInterface;
  filter: (query: unknown|null) =>  QueryBuilderInterface;
  include: (include: string) =>  QueryBuilderInterface;
  sort: (sort: string, dir?: "asc"|"desc") =>  QueryBuilderInterface;
  pageSize: (pageSize: number) =>  QueryBuilderInterface;
  pageNumber: (pageNumber: number) =>  QueryBuilderInterface;
}

/**
 * The basic data that comprises a given data query (GET request over HTTP or SELECT request in SQL)
 */
export interface QueryData {
  id: string|null;
  resourceType: string;
  filter: unknown|null;
  include: string[];
  sort: SortSpec[];
  pageSize: number|null;
  pageNumber: number|null;
}

/**
 * Data describing a parameter on which to sort results
 */
export type SortSpec = [string, "asc"|"desc"];

/**
 * An interface describing an object which can construct a query from QueryData. This is
 * intended to be extended in more specific contexts, such as REST or SQL.
 */
export interface QueryConstructorInterface {
  construct: (data: QueryData) => unknown;
}

/**
 * An interface describing an object which can add authentication data to a given request. This is
 * intended to be extended in more specific contexts, such as REST or SQL.
 */
export interface QueryAuthenticatorInterface {
  authenticate: (requestConfig: unknown) => unknown;
}

/**
 * An interface describing an object which can receive a query response and transform it into
 * a usable object in program space.. This is intended to be extended in more specific contexts,
 * such as REST or SQL.
 */
export interface QueryResponseParserInterface {
  parse: (response: unknown) => unknown;
}

