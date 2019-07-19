import { SimpleHttpResponseInterface } from "ts-simple-interfaces";
import { QueryResponseParserInterface } from "api-client-plumbing";

export class AdHocQueryResponseParser implements QueryResponseParserInterface {
  parse<T extends any>(response: SimpleHttpResponseInterface<T>): T {
    if (typeof response.data === "string") {
      return JSON.parse(response.data);
    } else {
      return response.data;
    }
  }
}
