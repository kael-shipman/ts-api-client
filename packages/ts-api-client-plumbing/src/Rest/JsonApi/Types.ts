import { ResourceRetrieverInterface as BaseResourceRetrieverInterface } from "../../Types";

/**
 * HTTP parameters for a standard query via JSON:API
 */
export type JsonApiParams = {
  include?: string;
  filter?: string;
  sort?: string;
  "page[number]"?: number;
  "page[size]"?: number;
}

/**
 * JSON:API data definitions
 */
export interface ResourceData<T extends string> {
  type: T;
  id: string;
  attributes?: unknown;
  relationships?: unknown;
}

/**
 * This type is a necessary union-type abstraction to facilitate some juggling when specifying
 * return types from heavily abstracted resource retrievers below.
 */
export type ResponseData<T extends string> = ResourceData<T>|Array<ResourceData<T>>;

export interface Error {
  title: string;
  detail: string;
  code?: number;
}

export interface SuccessDocument<T extends ResponseData<string>> {
  data: T,
  included?: Array<ResourceData<string>>;
  meta?: unknown;
}

export interface ErrorDocument {
  errors: Array<Error>;
}

export type Document<R extends ResponseData<string>> = SuccessDocument<R>|ErrorDocument;

export const isSuccess = function<R extends ResponseData<string>>(
  doc: any
): doc is SuccessDocument<R> {
  return typeof doc.errors === "undefined" && typeof doc.data !== "undefined";
}

// More specific version of ResourceRetriever Interface
export interface ResourceRetrieverInterface<T extends ResourceData<string>>
  extends BaseResourceRetrieverInterface<T> {
    withId: (id: string|null) =>  ResourceRetrieverInterface<T>;
    filter: (query: unknown|null) =>  ResourceRetrieverInterface<T>;
    include: (include: string) =>  ResourceRetrieverInterface<T>;
    sort: (sort: string, dir?: "asc"|"desc") =>  ResourceRetrieverInterface<T>;
    pageSize: (pageSize: number) =>  ResourceRetrieverInterface<T>;
    pageNumber: (pageNumber: number) =>  ResourceRetrieverInterface<T>;
    get: <U extends ResponseData<T["type"]>>() => Promise<Document<U>>;
  }


