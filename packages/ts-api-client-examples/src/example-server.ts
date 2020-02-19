/**
 * This server is meant to serve the apis that the example in this repo uses. It implements a very
 * basic (that is, quick-and-dirty) sort of query against an in-memory data back-end.
 *
 * **This is not meant to demonstrate any principles of any kind. It is solely to fulfill the
 * requirements of the example cli.**
 */

import {
  Weenie,
  configFromFiles,
  httpHandler,
  logger,
  loggerConfigValidator,
  webServiceConfigValidator,
} from "weenie-framework";
import * as rt from "runtypes";
import { DslQuery, DslQueryData, isQuery, isQueryLeaf } from "@openfinance/dsl-queries";

const exampleServerConfigValidator = rt.Record({
  logger: loggerConfigValidator,
  webservice: webServiceConfigValidator,
});
declare type ExampleServerConfig = rt.Static<typeof exampleServerConfigValidator>;

const r = Weenie(
  configFromFiles<ExampleServerConfig>(
    "./example-server.config.json",
    "./example-server.config.local.json",
    exampleServerConfigValidator
  )()
)
.and(logger)
.and(httpHandler);

r.http.get<{ userId: string }>([ "/v1/users", "/v1/users/:userId" ], async (req, res, next) => {
  const filterSpec = { fieldSpecs: { name: [ "like", "=", "!=" ] } };
  const filter = typeof req.query.filter === "string"
    ? new DslQuery(req.query.filter, filterSpec)
    : null;

  const page = <{ size: number; number: number; }>req.query.page || { size: 3, number: 1 };
  page.size = Number(page.size);
  page.number = Number(page.number);
  const sliceStart = (page.number - 1) * page.size;
  const sliceEnd = sliceStart + page.size;

  const include = (req.query as any).include;
  if (include && include !== "addresses") {
    r.logger.error(`Include parameter defined as '${include}'.`);
    res.status(400).send({
      errors: [{
        title: "Invalid 'include' Parameter",
        detail: "The only available include value is 'addresses'",
        status: 400,
      }]
    });
    return;
  }

  res.set(`Content-Type`, `application/vnd.api+json`);
  try {
    const includes: any = [];

    const format = (user: User) => {
      const jsonapi: any = {
        type: "users",
        id: user.id,
        attributes: {
          name: user.name,
          email: user.email,
        },
        relationships: {
          addresses: null
        }
      }

      if (include && include === "addresses") {
        jsonapi.relationships.addresses = { data: [] };
        db.addresses.filter((addr) => addr.userId === user.id).map((addr) => {
          includes.push({
            type: "addresses",
            id: addr.id,
            attributes: {
              street1: addr.street1,
              street2: addr.street2,
              city: addr.city,
              state: addr.state,
              zip: addr.zip
            },
            relationships: {
              user: {
                data: {
                  type: "users",
                  id: addr.userId,
                }
              }
            }
          });

          jsonapi.relationships.addresses.data.push({ type: "addresses", id: addr.id });
        });
      }

      return jsonapi;
    }

    let doc: any;
    if (req.params.userId) {
      r.logger.info(`Getting user id ${req.params.userId}`);
      const user = db.users.find((u) => u.id === req.params.userId);
      doc = { data: user ? format(user) : null };
      if (include) {
        doc.included = includes;
      }
    } else if (filter) {
      r.logger.info(`Returning users for filter: ${(req.query as any).filter}`);

      function applyFilter(f: DslQueryData, data: any) {
        r.logger.debug(`Processing DslQuery: ${JSON.stringify(f)} on ${JSON.stringify(data)}`);
        for (let i = 0; i < f.v.length; i++) {
          const v = f.v[i];

          // If it's a DslQuery, recurse
          if (isQuery(v, true)) {
            r.logger.debug(`Clause ${i} is a DslQuery. Recursing.`);
            if (!applyFilter(v, data)) {
              r.logger.debug(`Clause didn't pass.`);
              if (f.o === "and") {
                r.logger.debug(`Clause is an and-clause. Failing filter.`);
                return false;
              }
            } else if (f.o === "or") {
              r.logger.debug(`Clause is an or-clause. Passing filter.`);
              return true;
            }
          } else {
            if (!data[v[0]]) {
              if (f.o === "and") {
                r.logger.debug(`Clause is an and-clause. Failing filter.`);
                return false;
              }
            } else {
              if (v[1] === "=") {
                if (data[v[0]] !== v[2]) {
                  if (f.o === "and") {
                    r.logger.debug(`Clause is an and-clause. Failing filter.`);
                    return false;
                  }
                } else if (f.o === "or") {
                  r.logger.debug(`Clause is an or-clause. Passing filter.`);
                  return true;
                }
              } else if (v[1] === "!=") {
                if (data[v[0]] === v[2]) {
                  if (f.o === "and") {
                    r.logger.debug(`Clause is an and-clause. Failing filter.`);
                    return false;
                  }
                } else if (f.o === "or") {
                  r.logger.debug(`Clause is an or-clause. Passing filter.`);
                  return true;
                }
              } else if (v[1] === "like" ) {
                if (!data[v[0]].match(new RegExp(<string>v[2], "i"))) {
                  if (f.o === "and") {
                    r.logger.debug(`Clause is an and-clause. Failing filter.`);
                    return false;
                  }
                } else if (f.o === "or") {
                  r.logger.debug(`Clause is an or-clause. Passing filter.`);
                  return true;
                }
              }
            }
          }
        }

        r.logger.debug(`Operator: ${f.o}. Query pass: ${JSON.stringify(f.o === "and")}`);
        return f.o === "and";
      }

      doc = {
        data: db.users
        .filter((user) => applyFilter(filter.value!, user))
        .slice(sliceStart, sliceEnd)
        .map(format)
      };
      if (include) {
        doc.included = includes;
      }
    } else {
      r.logger.info(`Returning all users`);
      doc = { data: db.users.slice(sliceStart, sliceEnd).map(format) };
      if (include) {
        doc.included = includes;
      }
    }

    return res.send(doc);
  } catch (e) {
    return res.status(500).send({
      errors: [{
        title: "Server Error",
        detail: e.message,
        status: 500,
      }]
    });
  }
});

r.http.get("/v2/orders", async (req, res, next) => {
  const filter = JSON.parse(req.query.filter || "{}");
  if (!filter || !isQueryLeaf(filter) || filter[0] !== "ownerId" || filter[1] !== "=") {
    return res
      .status(400)
      .send({
        error: "You must pass `q=%5B%22ownerId%22%2C%22%3D%22%2C%22xxxxx%22%5D, where xxxxx is " +
        "the id of the owner for whom you want orders.",
      });
  }

  const page = <{ size: number; number: number; }>req.query.page || { size: 3, number: 1 };
  page.size = Number(page.size);
  page.number = Number(page.number);
  const sliceStart = (page.number - 1) * page.size;
  const sliceEnd = sliceStart + page.size;

  return res
    .status(200)
    .send(db.orders.filter((o) => o.ownerId === filter[2]).slice(sliceStart, sliceEnd).map((o) => {
      return {
        type: "orders",
        ...o,
      }
    }));
});

r.http.listen();






/**
 * Datastore
 */

declare type User = {
  id: string;
  name: string;
  email: string;
}

declare type Address = {
  id: string;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  userId: string;
} 

declare type Order = {
  id: string;
  quantity: number;
  price: number;
  ownerId: string;
}

const db: { users: Array<User>, addresses: Array<Address>, orders: Array<Order> } = {
  users: [
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Bette Midler",
      email: "bette.midler@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Boo Radley",
      email: "boo.radley@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Gilda Radley",
      email: "Gilda.Radley@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Ricardo Fabricante",
      email: "ricardo.fabricante@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Richard Carlson",
      email: "richie.carlson@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Richard Wright",
      email: "richie.wright@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Richard Wright",
      email: "richie.wright@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Richard Wright",
      email: "richie.wright@gmail.com",
    },
    {
      id: String(Math.round(Math.random()*1000000)),
      name: "Richard Wright",
      email: "richie.wright@gmail.com",
    },
  ],
  addresses: [],
  orders: [],
}

db.users.map((user) => {
  // Insert 1 to 3 addresses for each user
  const n = Math.round(Math.random() * 2) + 1;
  r.logger.info(`Adding ${n} addresses for user ${user.name} (${user.id})`);
  for (let i = 0; i < n; i++) {
    db.addresses.push({
      id: String(Math.round(Math.random()*100000)),
      street1: `${Math.round(Math.random()*5000) + 1} Main St.`,
      street2: Math.round(Math.random()*100) > 70 ? `#${Math.round(Math.random()*20) + 1}` : null,
      city: `Bourbonnais`,
      state: `IL`,
      zip: `60914`,
      userId: user.id,
    });
  }

  const m = Math.random() * 100 < 80
    ? Math.round(Math.random() * 5) + 1
    : Math.round(Math.random() * 20) + 1;
  r.logger.info(`Adding ${m} orders for user ${user.name} (${user.id})`);
  for (let i = 0; i < m; i++) {
    db.orders.push({
      id: String(Math.round(Math.random()*1e7)),
      quantity: Math.round(Math.random() * 9) + 1,
      price: Math.round(Math.random() * 250)/100 + 5,
      ownerId: user.id,
    });
  }
});
