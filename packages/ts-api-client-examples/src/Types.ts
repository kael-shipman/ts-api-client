import * as plumbing from "api-client-plumbing";

export interface UserInterface extends plumbing.Rest.JsonApi.ResourceInterface<"users"> {
  attributes: {
    name: string;
    email: string;
  },
  relationships: {
    address: {
      data: plumbing.Rest.JsonApi.ResourceInterface<"addresses">|null;
    }
  }
}

export interface AddressInterface extends plumbing.Rest.JsonApi.ResourceInterface<"addresses"> {
  attributes: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
  }
}

export interface OrderInterface extends plumbing.Rest.JsonApi.ResourceInterface<"orders"> {
  attributes: {
    quantity: number;
    price: number;
  }
}

export type Resources = UserInterface|AddressInterface|OrderInterface;

export interface RelatedResourceMap<Resource extends Resources> {
  resource: Resource;
  q: plumbing.ResourceRetrieverInterface;
  n: number;
}

