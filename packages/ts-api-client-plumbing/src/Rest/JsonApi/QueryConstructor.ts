import {
  QueryData,
  QueryConstructorInterface,
} from "../../Types";
import { JsonApiParams, } from "./Types";
import {
  SimpleHttpRequestConfig,
} from "ts-simple-interfaces";

export class QueryConstructor implements QueryConstructorInterface {
  public constructor(protected baseUrl: string) {
  }

  public construct(data: QueryData): SimpleHttpRequestConfig {
    return {
      method: "GET",
      baseURL: this.baseUrl,
      url: `/${data.resourceType}${data.id !== null ? `/${data.id}` : ""}`,
      params: this.composeRequestParams(data),
      headers: this.composeRequestHeaders(data),
    };
  }

  /*
    public get(): Promise<false|QueryResultInterface<object>> {

        if (this._httpClient === null) {
            throw new Error("Programmer: No HTTP client set. You must set an HTTP client for this ApiQuery instance before attempting to use it. Usually this is done near instantiation of the ApiQuery object.");
        }

        if (this._done) {
        }

        const t = this;
        return this._httpClient.request(this.composeRequest())
        .then(function(response: AxiosResponse<object>): QueryResultInterface<object> {
            return new QueryResult(t, response.data);
        })
        .catch(function(e: Error) {
            throw e;
        });
    }
   */

  protected composeRequestParams(data: QueryData): object {
    let params: JsonApiParams = {};

    params["page[size]"] = data.pageSize || 30;
    params["page[number]"] = data.pageNumber || 0;

    if (data.include.length > 0) {
      params.include = data.include.join(",");
    }
    if (data.sort.length > 0 ) {
      let jsonApiSort = [];
      for (let s of data.sort) {
        jsonApiSort.push(s[1] === "desc" ? `-${s[0]}` : s[0]);
      }
      params.sort = jsonApiSort.join(",");
    }
    if (data.filter !== null) {
      if (typeof data.filter === "string") {
        params.filter = data.filter;
      } else {
        throw new Error("Expecting 'filter' parameter to be a string, but instead it is a(n) " + (typeof data.filter));
      }
    }

    return params;
  }

  protected composeRequestHeaders(data: QueryData): any {
    return {
      Accept: "application/vnd.api+json"
    }
  }
}


