//import * as plumbing from "api-client-plumbing";
import { UsersCli } from "./Clis";
/*
import {
  UserInterface,
  OrderInterface,
  RelatedResourceMap,
} from "./Types";
*/
import * as Prompt from "prompt-sync";
import { MySDK } from "./MySDK";

/**
 * This small application demonstrates the capabilities of the final API client. In particular:
 *
 * * It's easy and natural to create an SDK that speaks a _domain_ language, regardless
 *   of how many APIs -- each with its own particular authentication and data enveloping
 *   implementations -- are necessary to make that work.
 * * It's easy and natural to define a search and then iterate over pages of that search.
 * * The typings you define in your SDK implementation can be as vague or specific as
 *   you wish.
 *
 * This application is a simple interactive CLI for getting users from a server and then
 * listing their orders.
 *
 * For this application, we've created an SDK that pulls together two APIs into one domain
 * represented by the `MySDK` class. Both servers use the same credentials for authn, but one
 * requires the credentials in a standard `Basic` Authorization header while the other requires
 * them in an `X-Api-Credentials` header. (This is an example of a migration in progress.)
 * Furthermore, one API speaks JSON:API, while the other speaks a simple, unformalized JSON.
 *
 * Here in the application, all we have to worry about is using the results correctly,
 * which typescript helps us with.
 *
 * (For reference, the `users` and `addresses` endpoints are on the JSON:API connection,
 * while the `orders` endpoint is on the informal API.
 */


// First we instantiate the SDK using our api key and secret
const api = new MySDK("abcde12345", "12345abcde");
const cli = new UsersCli(Prompt(), api);
cli.showMenu();


/*
// Here, we're going to iterate over all pages of the query and build a list of orders
// for each user name John
const ordersForUsersNamedJohn: Array<RelatedResourceMap<UserInterface>> = [];
const gatherData = function(q: plumbing.ResourceRetrieverInterface, n: number): Promise<void> {
  return q.get()
  .then((users: Array<UserInterface>) => {
    if (users.length > 0 && n < 2) {
      for (let i = 0; i < users.length; i++) {
        ordersForUsersNamedJohn.push({
          resource: users[i],
          q: api.orders
            .pageSize(3)
            .filter(JSON.stringify(["owner", "=", users[i].id])),
          n: 0
        });
      }
      return gatherData(q.pageNumber(n+1), n+1);
    }
    return Promise.resolve();
  });
}


// Define a function to call when we ask to see orders
const showOrders = function(n: number): Promise<void> {
  const map = ordersForUsersNamedJohn[n];
  if (!map) {
    console.log(`ERROR: Invalid selection '${n}'. Try again.`);
    return Promise.resolve();
  }

  console.log(`Orders for user ${map.resource.attributes.name}`);
  console.log();
  return map.q.get().then((orders: Array<OrderInterface>) => {
    if (orders.length === 0 || map.n >= 2) {
      console.log("No more orders to display for this user.");
    } else {
      // List orders on screen
      for (let i = 0; i < orders.length; i++) {
        console.log(
          `  ${map.n * 3 + i + 1}. ${orders[i].quantity}@${orders[i].price}`
        );
      }

      // Advance pointer to next page
      map.n = map.n + 1;
      map.q = map.q.pageNumber(map.n);
    }
  });
}


// Finally, we dump all the data we gathered to screen and present a menu
gatherData(usersLikeJohn, 0)
.then(() => {
  console.log("Users named John:");
  console.log();
  for (let i = 0; i < ordersForUsersNamedJohn.length; i++) {
    const map = ordersForUsersNamedJohn[i];
    const user = map.resource;
    console.log(`  ${i+1}. ${user.attributes.name} (${user.id})`);
  }
  console.log();

  //askLoop();

  showOrders(1);
  console.log();
});
 */

