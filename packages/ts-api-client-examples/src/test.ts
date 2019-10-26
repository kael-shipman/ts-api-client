export type SortSpec = [string, "asc"|"desc"];

export interface  QueryBuilderInterface {
  readonly value: QueryData;
  withId: (id: string|null) =>  QueryBuilderInterface;
  filter: (query: unknown|null) =>  QueryBuilderInterface;
  include: (include: string) =>  QueryBuilderInterface;
  sort: (sort: string, dir?: "asc"|"desc") =>  QueryBuilderInterface;
  pageSize: (pageSize: number) =>  QueryBuilderInterface;
  pageNumber: (pageNumber: number) =>  QueryBuilderInterface;
}

export interface QueryData {
  id: string|null;
  resourceType: string;
  filter: unknown|null;
  include: string[];
  sort: SortSpec[];
  pageSize: number|null;
  pageNumber: number|null;
}

export interface ResourceRetrieverInterface<T extends unknown> extends QueryBuilderInterface {
  withId: (id: string|null) =>  ResourceRetrieverInterface<T>;
  filter: (query: unknown|null) =>  ResourceRetrieverInterface<T>;
  include: (include: string) =>  ResourceRetrieverInterface<T>;
  sort: (sort: string, dir?: "asc"|"desc") =>  ResourceRetrieverInterface<T>;
  pageSize: (pageSize: number) =>  ResourceRetrieverInterface<T>;
  pageNumber: (pageNumber: number) =>  ResourceRetrieverInterface<T>;
  get: <U extends T|Array<T>>() => Promise<unknown>;
}







// JsonApi

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

export type ResponseData<T extends string> = ResourceData<T>|Array<ResourceData<T>>;

export interface Error {
    title: string;
    detail: string;
    code?: number;
}

export interface SuccessDocument<T extends ResponseData<string>> {
    data: T,
    included?: Array<ResourceData<string>>;
}

export interface ErrorDocument {
    errors: Array<Error>;
}

export type Document<R extends ResponseData<string>> = SuccessDocument<R>|ErrorDocument;

export const isSuccess = function<R extends ResponseData<string>>(doc: any): doc is SuccessDocument<R> {
    return typeof doc.errors === "undefined";
}

// More specific version of ResourceRetriever Interface
export interface JsonApiResourceRetrieverInterface<T extends ResourceData<string>>
extends ResourceRetrieverInterface<T> {
  withId: (id: string|null) =>  ResourceRetrieverInterface<T>;
  filter: (query: unknown|null) =>  ResourceRetrieverInterface<T>;
  include: (include: string) =>  ResourceRetrieverInterface<T>;
  sort: (sort: string, dir?: "asc"|"desc") =>  ResourceRetrieverInterface<T>;
  pageSize: (pageSize: number) =>  ResourceRetrieverInterface<T>;
  pageNumber: (pageNumber: number) =>  ResourceRetrieverInterface<T>;
  get: <U extends ResponseData<T["type"]>>() => Promise<Document<U>>;
}









export class ResourceRetriever<
  Resource extends ResourceData<string>
> implements ResourceRetrieverInterface<Resource> {
  public constructor(
    protected resourceType: string,
  ) { }

  public get<R extends ResponseData<Resource["type"]>>(t?: "array"|"error"|"resource"): Promise<Document<R>> {
    let doc: any = {};
    const user = {
      id: "abcde",
      type: "users",
      attributes: {
        name: "Kael",
        email: "kael.shipman@gmail.com",
      }
    };

    if (!t || t === "resource") {
      doc.data = user
    } else if (t === "error") {
      doc.errors = [
        {
          title: "Some Error",
          detail: "This is some error",
        }
      ];
    } else {
      doc.data = [ user ];
    }

    return Promise.resolve(doc);
  }



  public withId(id: string|null): ResourceRetrieverInterface<Resource> {
    return this;
  }

  public filter(filter: string|null): ResourceRetrieverInterface<Resource> {
    return this;
  }

  public include(include: string): ResourceRetrieverInterface<Resource> {
    return this;
  }

  public sort(sort: string, dir: "asc"|"desc"): ResourceRetrieverInterface<Resource> {
    return this;
  }

  public pageNumber(pageNumber: number): ResourceRetrieverInterface<Resource> {
    return this;
  }

  public pageSize(pageSize: number): ResourceRetrieverInterface<Resource> {
    return this;
  }

  get value(): QueryData {
    return {
      id: "abce",
      resourceType: this.resourceType,
      filter: null,
      include: [],
      sort: [],
      pageSize: null,
      pageNumber: null,
    }
  }

  protected clone(builder: QueryBuilderInterface): ResourceRetrieverInterface<Resource> {
    return new ResourceRetriever<Resource>(
      this.resourceType,
    );
  }
}






export interface UserInterface extends ResourceData<"users"> {
  attributes: {
    name: string;
    email: string;
  };
  relationships?: {}
}



const usersApi = new ResourceRetriever<UserInterface>("users");
const call = usersApi.get<Array<UserInterface>>("array");
call.then((res) => {
  if (!isSuccess(res)) {
    throw Error(res.errors[0].detail);
  } else {
    for (const user of res.data) {
      console.log(user.attributes.email);
    }
  }
});

