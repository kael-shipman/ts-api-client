import { AbstractCli } from "./AbstractCli";
import { UserInterface, AddressInterface, OrderInterface, } from "../Types";
import { MySDK } from "../MySDK";
import { Prompt } from "prompt-sync";
import * as plumbing from "api-client-plumbing";
import * as AdHocRequest from "../AdHocRequest";

export class MainCli extends AbstractCli {
  public constructor(protected readline: Prompt, protected api: MySDK) {
    super(readline, false);
  }

  protected choices: { [c: number]: string } = {
    1: "Search users",
    2: "Get User Orders",
  };

  public async dispatch(choice: number): Promise<boolean> {
    // Choice 1 is "Search Users". We want the user to supply a search term and then show them
    // pages of results until they've found the user they want.
    if (choice === 1) {
      // Get the user's search term
      let search: string = "";
      while (search === "") {
        search = this.readline("Search users by name: ");
      }

      console.log();

      // Now prepare a query with that search term. In the loop below, we'll just increment the
      // page and run the query again until the user has found what they're looking for.
      //
      // In this case, we're filtering where "name is like the search term", we're including the
      // user's address, and we want three results per page.
      const users: { [id: string] : UserInterface } = {};
      let page: number = 1;
      let usersQuery = this.api.users
        .filter(JSON.stringify(["name", "like", `${search}`]))
        .include("addresses")
        .pageSize(3);

      let errorCount = 0;
      do {
        try {
          // Use the prepared query to get results from the server, telling the compiler that
          // we're expecting an array of users. Note that the compiler will enforce that we're
          // requesting _only_ UserInterface here because this must agree with the type that we
          // used to instantiate the users datasource, which was UserInterface.
          const res = await usersQuery.get<Array<UserInterface>>();

          // Check that the result is a success
          if (plumbing.Rest.JsonApi.isSuccess(res)) {
            // Iterate through result set.
            for (const u of res.data) {
              // Index users in our cache by the last 8 characters of their UUID
              users[u.id] = u;

              // This is to demonstrate getting included resources, in this case addresses
              const addrs = u.relationships.addresses === null
                ? null
                : <Array<AddressInterface>> res.included!.filter((r) => {
                  return r.type === "addresses" &&
                    u.relationships.addresses !== null &&
                    u.relationships.addresses.data.find((a) => r.id === a.id);
                });

              // Dump complex data from the query for each user record
              console.log(
                `${u.id}: ${u.attributes.name} ` +
                `(at zipcodes ${
                  (addrs && addrs.length > 0)
                    ? addrs.map((a) => a.attributes.zip).join(", ")
                    : "unknown"
                })`
              );
            }

            // If we returned fewer results than we requested, then we know we're done
            if (res.data.length < 3) {
              console.log();
              console.log(`No further results`);
              break;
            }

            // Otherwise, give the user a chance to request the next page or just quit here
            console.log();
            const next = this.readline("Next page? [Y,n] ").toLowerCase();
            console.log();
            if (next.trim() === "n") {
              break;
            }

            // If we're still going, just advance the query to the next page
            usersQuery = usersQuery.pageNumber(++page);
          } else {
            // If we get an error in return, then it's going to be a JSON:API errors document,
            // which typescript knows because we used a union to define the `data` property of
            // this response and this is the other fork of the `isSuccess` function used above.
            // Iterate through the errors and display them in the message.
            throw new Error(
              "Error communicating with Users API. Try again later. Errors: \n\n    " +
              res.errors.map((e) => `${e.title}: ${e.detail}`).join("\n    ")
            );
          }
        } catch (e) {
          // If we get more than three errors while trying to do this, just scream about it and
          // give up
          errorCount++;
          if (errorCount > 3) {
            console.error(`ERROR: ${e.message}`);
            break;
          }
        }
      } while (true);

      return true;

    // prettier-ignore Choice 2 is "View Orders for User". We want the user to supply a user ID,
    // then show them all orders for that userID. Note that this API transacts in flat JSON format,
    // but because it's abstracted behind our SDK, it looks basically the same to us here.
    } else if (choice === 2) {

      do {
        // Get the user id to search
        let userId: string = "";
        while (userId === "") {
          userId= this.readline("Enter user ID (enter 's' to search): ");
        }

        console.log();

        // If we want to search for a user ID, then fire up the search function
        if (userId.toLowerCase() === "s") {
          await this.dispatch(1);
          continue;
        }

        // Now prepare a query with that user ID. In the loop below, we'll just increment the
        // page and run the query again until the user has found what they're looking for.
        let page: number = 1;
        let ordersQuery = this.api.orders
          .filter(JSON.stringify(["ownerId", "=", `${userId}`]))
          .pageSize(3);

        let errorCount = 0;
        do {
          try {
            // Use the prepared query to get results from the server, telling the compiler that
            // we're expecting an array of orders. Note that the compiler will enforce that we're
            // requesting _only_ OrderInterface here because this must agree with the type that we
            // used to instantiate the orders datasource, which was OrderInterface.
            const res = await ordersQuery.get<Array<OrderInterface>>();

            // Check that the result is a success
            if (AdHocRequest.isSuccess(res)) {
              // Iterate through result set.
              for (const o of res.data) {
                // Display data for each order
                console.log(`${o.id}: ${o.quantity} @ \$${Math.round(o.price * 100)/100}`);
              }

              // If we returned fewer results than we requested, then we know we're done
              if (res.data.length < 3) {
                console.log();
                console.log(`No further results`);
                break;
              }

              // Otherwise, give the user a chance to request the next page or just quit here
              console.log();
              const next = this.readline("Next page? [Y,n] ").toLowerCase();
              console.log();
              if (next.trim() === "n") {
                break;
              }

              // If we're still going, just advance the query to the next page
              ordersQuery = ordersQuery.pageNumber(++page);
            } else {
              // If we get an error in return, then it's going to be a string on the `error`
              // property, which typescript knows because we used a union to define the `data`
              // property of this response and this is the other fork of the `isSuccess` function
              // used above.
              throw new Error(
                `Error communicating with Users API. Try again later. Error: ${res.data.error}`
              );
            }
          } catch (e) {
            // If we get more than three errors while trying to do this, just scream about it and
            // give up
            errorCount++;
            if (errorCount > 3) {
              console.error(`ERROR: ${e.message}`);
              break;
            }
          }
        } while (true);

        return true;
      } while (true);
      return true;
    } else {
      return false;
    }
  }
}

