import { SimpleHttpResponseInterface } from "ts-simple-interfaces";
import { QueryResponseParserInterface } from "../../Types";

export class QueryResponseParser implements QueryResponseParserInterface {
  parse<T extends any>(response: SimpleHttpResponseInterface<T>): T {
    if (typeof response.data === "string") {
      return JSON.parse(response.data);
    } else {
      return response.data;
    }
  }
}
