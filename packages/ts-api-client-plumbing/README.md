Data Query Plumbing
====================================================================================

>
> **WORK IN PROGRESS**
>
> This repo is an attempt to break away and encapsulate some of the code comprising
> jsonapi-client-experiments. It has not yet come into a useable form. Much of the
> code in this repo is just copy-pasted from that repo.
>

>
> **SECOND WARNING**
>
> Even in its final form, this code will be somewhat difficult to understand it is a plumbing
> package, meaning that it is intended to be a low- to mid-level abstraction, and is intended to
> be used to compose higher-level abstractions.
>
> I'll attempt to include documentation in each module about what it's role is and how it's
> intended to be used to build a bigger, easier to use system.
>

This library is more of a plumbing library than an end-user library. It provides abstractions for
defining "fluent" query builders for HTTP, SQL and other datasources.

It focuses exclusively on "filter" queries, i.e., HTTP "GET" and SQL "SELECT". It is intended
to be immediately useful in other systems like data backends and HTTP clients and is NOT intended
to be used directly by end-users.

## Usage

Most commonly, the library will be used by either using the concrete `JsonApiQueryConstructor`
class or by implementing the `QueryConstructorInterface`. Either way, these will usually
be used within a concrete data source interface to easily define data requests.

An end-use example might be:

```ts
import { MySDK } from "./MySDK";

const sdk = new MySDK("https://mysite.com/api/v1", "my-key", "my-secret");

// Note: This uses filtering a la @openfinance/dsl-queries
const users = await sdk.users()
  .filter(["createdOn", ">=", "2019-01-01T00:00:00Z"])
  .sort("createdOn", "desc")
  .pageNumber(1)
  .get();

// This would translate to an HTTP call resembling
// {
//   method: "GET",
//   url: "https://mysite.com/api/v1/users",
//   params: [
//     ["filter", '["createdOn",">=","2019-01-01T00:00:00Z"]'],
//     ["sort", "-createdOn"],
//     ["page[number]", 1]
//   ],
//   headers: {
//     "Authorization": "Basic bXkta2V5Om15LXNlY3JldAo=",
//     "Accept": "application/vnd.api+json",
//   }
// }
```

Behind the scenes, `MySDK` is composed of several swappable components:

* Every call to an endpoint method (`users`, `legalEntities`, etc...) returns a fresh
  `ResourceRetriever` interface.
* Each `ResourceRetriever` is a wrapper around a `QueryBuilder` (which simply builds up the data
  pertaining to a given query) and a `QueryExecutor` (which uses the data in the `QueryBuilder` to
  format and send the final request).
* Each `QueryExecutor` utilizes a `QueryAuthenticator` to add pertinent Authn information to the
  query.
* Additionally, each `QueryExecutor` utlizes a `QueryResponseParser` to parse the final response
  into usable form.

At first glance, this looks like a lot of moving parts for something that is presumably fairly
simple. However, the design is such that it allows the people who _build_ SDKs to assemble them
from a variety of easily-swappable and extendable parts and it allows the people who _use_ SDKs
to maintain familiarity with the high-level interface across projects and across API back-ends.

It also allows SDK builders to migrate endpoints in a fine-grained way, by simply assigning
different `QueryExecutors` according to needs.

For example, let's say my `users` endpoint is at `/v1/users` and returns a somewhat bespoke
object (think `{"name":"my name", "email": "my.name@gmail.com", ....}`), while my `addresses`
endpoint is at `/v2/addresses` and returns JSON:API. As an SDK builder, I can hide this
complexity by utilizing a simple `QueryExecutor` for the users endpoint and a JSON:API-aware
`QueryExecutor` for the `addresses` endpoint. From the end programmer's perspective, they're
accessed in virtually the same way, the only difference being the format of the response (which,
of course, the SDK builder may choose to standardize by utilizing the correct
`QueryResponseParser`s).

