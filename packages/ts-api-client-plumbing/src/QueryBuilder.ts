import {
  QueryBuilderInterface,
  SortSpec,
  QueryData,
} from "./Types";

export class QueryBuilder implements QueryBuilderInterface {
  protected _id: string|null = null;
  protected _filter: unknown|null = null;
  protected _include: string[] = [];
  protected _sort: SortSpec[] = [];
  protected _pageSize: number|null = null;
  protected _pageNumber: number|null = null;

  public constructor(protected _resourceType: string, d?: Partial<QueryData>) {
    if (typeof d !== "undefined") {
      if (typeof d.id !== "undefined") {
        this._id = d.id;
      }
      if (typeof d.filter !== "undefined") {
        this._filter = d.filter;
      }
      if (typeof d.include !== "undefined") {
        this._include = d.include;
      }
      if (typeof d.sort !== "undefined") {
        this._sort = d.sort;
      }
      if (typeof d.pageSize !== "undefined") {
        this._pageSize = d.pageSize;
      }
      if (typeof d.pageNumber !== "undefined") {
        this._pageNumber = d.pageNumber;
      }
    }
  }

  public withId(id: string|null): QueryBuilderInterface {
    if (this._filter !== null) {
      throw new Error("You've passed an ID and a filter paramter. If you pass an ID, you must not pass any filter parameters.");
    }
    return this.clone({id});
  }

  public filter(filter: string|null): QueryBuilderInterface {
    if (this._id !== null) {
      throw new Error("You've passed a filter, but the id paramter is already set. If you pass a filter, you must not pass an id.");
    }
    return this.clone({filter});
  }

  public include(include: string): QueryBuilderInterface {
    return this.clone({include: [include]});
  }

  public sort(sort: string, dir: "asc"|"desc"): QueryBuilderInterface {
    return this.clone({sort: [[sort, dir]]});
  }

  public pageNumber(pageNumber: number): QueryBuilderInterface {
    return this.clone({pageNumber});
  }

  public pageSize(pageSize: number): QueryBuilderInterface {
    return this.clone({pageSize});
  }

  get value(): QueryData {
    return {
      resourceType: this._resourceType,
      id: this._id,
      filter: this._filter,
      include: this._include,
      sort: this._sort,
      pageSize: this._pageSize,
      pageNumber: this._pageNumber
    }
  }

  protected clone(d: Partial<QueryData>): QueryBuilderInterface {
    if (typeof d.id === "undefined") {
      d.id = this._id;
    }
    if (typeof d.filter === "undefined") {
      // TODO: Figure out how to pass this by value, in case it's a complex object
      d.filter = this._filter;
    }
    if (typeof d.include === "undefined") {
      // Copy the array, to avoid passing same array forward by reference
      d.include = this._include.filter(v => true);
    } else {
      // concat returns a new array anyway, so no big deal here
      d.include = this._include.concat(d.include);
    }
    if (typeof d.sort === "undefined") {
      d.sort = this._sort.filter(v => true);
    } else {
      d.sort = this._sort.concat(d.sort);
    }
    if (typeof d.pageSize === "undefined") {
      d.pageSize = this._pageSize;
    }
    if (typeof d.pageNumber === "undefined") {
      d.pageNumber = this._pageNumber;
    }

    return this.newSelf(this._resourceType, <QueryData>d);
  }

  protected newSelf(resourceType: string, d: QueryData): QueryBuilderInterface {
    return new QueryBuilder(resourceType, d);
  }
}

