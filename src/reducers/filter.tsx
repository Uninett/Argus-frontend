import { Filter } from "../api";

import { ActionMap } from "./common";

export enum FilterType {
  Create = "CREATE_FILTER",
  Delete = "DELETE_FILTER",
  Modify = "MODIFY_FILTERS",
  LoadAll = "LOAD_FILTERS",
}

type FilterPayload = {
  // Used to override all local modifications with
  // data from backend
  [FilterType.LoadAll]: Filter[];

  // When a filter is modified.
  [FilterType.Modify]: Filter;

  // When a new filter is created.
  [FilterType.Create]: Filter;

  // When a filter is deleted
  [FilterType.Delete]: Filter["pk"];
};

export type FilterActions = ActionMap<FilterPayload>[keyof ActionMap<FilterPayload>];
export const filterReducer = (state: Filter[], action: FilterActions) => {
  switch (action.type) {
    case FilterType.LoadAll:
      return action.payload;
    case FilterType.Modify: {
      const index = state.findIndex((f: Filter) => f.pk === action.payload.pk);
      const updated = [...state];
      updated[index] = { ...updated[index], ...action.payload };
      return updated;
    }
    case FilterType.Create:
      return [...state, action.payload];
    case FilterType.Delete:
      return [...state.filter((filter: Filter) => filter.pk !== action.payload)];
  }
};

type Action<T, P> = (payload: P) => { type: T; payload: P };
function makeAction<T, P>(type: T): Action<T, P> {
  return (payload: P): { type: T; payload: P } => {
    return { type, payload };
  };
}

export const loadAllFilters = makeAction<FilterType.LoadAll, Filter[]>(FilterType.LoadAll);
export const modifyFilter = makeAction<FilterType.Modify, Filter>(FilterType.Modify);
export const createFilter = makeAction<FilterType.Create, Filter>(FilterType.Create);
export const deleteFilter = makeAction<FilterType.Delete, Filter["pk"]>(FilterType.Delete);
