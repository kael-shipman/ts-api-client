import { QueryAuthenticatorInterface, } from "../Types";
import { SimpleHttpRequestConfig, } from "ts-simple-interfaces";

/**
 * An extension of the QueryAuthenticatorInterface which specifies the input and output types
 * as HTTP request parameters.
 */
export interface BasicQueryAuthenticatorInterface extends QueryAuthenticatorInterface {
  authenticate: (requestConfig: SimpleHttpRequestConfig) => SimpleHttpRequestConfig;
}

