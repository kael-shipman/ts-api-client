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
 * A shoddy stub JSON:API resource interface. This should not be used going forward.
 */
export interface ResourceInterface<T extends string> {
  type: T;
  id: string;
  attributes?: unknown;
  relationships?: unknown;
}

