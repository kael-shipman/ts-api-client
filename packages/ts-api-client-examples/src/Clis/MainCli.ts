import { AbstractCli } from "./AbstractCli";
import { UserInterface, AddressInterface } from "../Types";
import { MySDK } from "../MySDK";
import { Prompt } from "prompt-sync";
import * as plumbing from "api-client-plumbing";

export class MainCli extends AbstractCli {
  public constructor(protected readline: Prompt, protected api: MySDK) {
    super(readline, false);
  }

  protected choices: { [c: number]: string } = {
    1: "Search users",
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

      // Now prepare a query with that search term. In the loop below, we'll just increment the
      // page and run the query again until the user has found what they're looking for.
      //
      // In this case, we're filtering where "name is like the search term", we're including the
      // user's address, and we want three results per page.
      const users: { [id: string] : UserInterface } = {};
      let page: number = 1;
      let usersQuery = this.api.users
        .filter(JSON.stringify(["name", "like", `%${search}%`]))
        .include("address")
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
              users[u.id.substr(-8)] = u;

              // This is to demonstrate getting included resources, in this case addresses
              const addr = u.relationships.address.data === null
                ? null
                : <AddressInterface> res.included!.find((r) => {
                  return r.type === "addresses" && r.id === u.relationships.address.data!.id;
                });

              // Dump complex data from the query for each user record
              console.log(
                `${u.id.substr(-8)}: ${u.attributes.name} ` +
                `(at ${addr ? addr.attributes.zip : "unknown"})`
              );
            }

            // If we returned fewer results than we requested, then we know we're done
            if (res.data.length < 3) {
              break;
            }

            // Otherwise, give the user a chance to request the next page or just quit here
            const next = this.readline("Next page? [Y,n] ").toLowerCase();
            if (next.trim() === "n") {
              break;
            }

            // If we're still going, just advance the query to the next page
            usersQuery = usersQuery.pageNumber(++page);
          } else {
            // If we get an error in return, then it's going to be a JSON:API errors document.
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

      this.readline("Hit enter to return to the main menu");
      return true;
    } else {
      return false;
    }
  }
}

