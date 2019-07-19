export const users: Array<any> = [
  {
    type: "users",
    id: "aaaaa",
    attributes: {
      name: "John Richard",
      email: "john.richard@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "a1a1a1"
        }
      }
    }
  },
  {
    type: "users",
    id: "bbbbbb",
    attributes: {
      name: "John Scrohn",
      email: "john.scrohn@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "b2b2b2"
        }
      }
    }
  },
  {
    type: "users",
    id: "cccccc",
    attributes: {
      name: "John Rocket",
      email: "john.rocket@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "c3c3c3"
        }
      }
    }
  },
  {
    type: "users",
    id: "dddddd",
    attributes: {
      name: "John Alma",
      email: "john.alma@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "d1d1d1"
        }
      }
    }
  },
  {
    type: "users",
    id: "eeeeee",
    attributes: {
      name: "John Lobster",
      email: "john.lobster@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "e1e1e1"
        }
      }
    }
  },
  {
    type: "users",
    id: "ffffff",
    attributes: {
      name: "John Leeder",
      email: "john.leeder@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "f1f1f1"
        }
      }
    }
  },
  {
    type: "users",
    id: "111111",
    attributes: {
      name: "John Swift",
      email: "john.swift@gmail.com"
    },
    relationships: {
      address: {
        data: {
          type: "addresses",
          id: "1f1f1f"
        }
      }
    }
  },
];

export const addresses: Array<any> = [
  {
    type: "addresses",
    id: "a1a1a1",
    attributes: {
      street1: "123 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "b2b2b2",
    attributes: {
      street1: "456 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "c3c3c3",
    attributes: {
      street1: "789 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "d1d1d1",
    attributes: {
      street1: "987 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "e1e1e1",
    attributes: {
      street1: "654 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "f1f1f1",
    attributes: {
      street1: "321 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
  {
    type: "addresses",
    id: "1f1f1f",
    attributes: {
      street1: "111 Main St",
      city: "Chicago",
      state: "IL",
      zip: "60606"
    }
  },
];

export const orders: Array<any> = [
  {
    id: "aaaa",
    type: "orders",
    quantity: 123,
    price: 1.50,
    ownerId: "aaaaaa"
  },
  {
    id: "bbbb",
    type: "orders",
    quantity: 2222,
    price: 1.50,
    ownerId: "aaaaaa"
  },
  {
    id: "cccc",
    type: "orders",
    quantity: 111,
    price: 1.23,
    ownerId: "aaaaaa"
  },
  {
    id: "dddd",
    type: "orders",
    quantity: 88,
    price: 1.10,
    ownerId: "aaaaaa"
  },
  {
    id: "eeee",
    type: "orders",
    quantity: 83,
    price: 1.52,
    ownerId: "aaaaaa"
  },
  {
    id: "ffff",
    type: "orders",
    quantity: 2323,
    price: 1,
    ownerId: "aaaaaa"
  },
  {
    id: "0000",
    type: "orders",
    quantity: 52,
    price: 1.53,
    ownerId: "aaaaaa"
  },
  {
    id: "1111",
    type: "orders",
    quantity: 33,
    price: 1.55,
    ownerId: "bbbbbb"
  },
  {
    id: "2222",
    type: "orders",
    quantity: 5234,
    price: 2.55,
    ownerId: "bbbbbb"
  },
  {
    id: "3333",
    type: "orders",
    quantity: 122,
    price: 1.33,
    ownerId: "bbbbbb"
  },
  {
    id: "4444",
    type: "orders",
    quantity: 188,
    price: 1.88,
    ownerId: "bbbbbb"
  },
  {
    id: "5555",
    type: "orders",
    quantity: 5500,
    price: 11.53,
    ownerId: "cccccc"
  },
]
