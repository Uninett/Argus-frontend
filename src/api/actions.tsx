import React, { useContext } from "react";
import api, { Filter, FilterSuccessResponse } from "../api";
import { InitialStateType, ActionsType } from "../contexts";
import {
  createFilter as createFilterAction,
  deleteFilter as deleteFilterAction,
  modifyFilter as modifyFilterAction,
} from "../reducers/filter";

import { AppContext } from "../contexts";

type Dispatch = React.Dispatch<ActionsType>;

export const createFilter = (dispatch: Dispatch, filter: Omit<Filter, "pk">): Promise<Filter> => {
  const definition = {
    sourceSystemIds: filter.sourceSystemIds,
    tags: filter.tags,
  };
  return api.postFilter(filter.name, definition).then((response: FilterSuccessResponse) => {
    const { name, pk } = response;
    const newFilter = { ...filter, name, pk };
    dispatch(createFilterAction(newFilter));
    return newFilter;
  });
};

export const deleteFilter = (dispatch: Dispatch, pk: Filter["pk"]): Promise<void> => {
  return api.deleteFilter(pk).then(() => {
    dispatch(deleteFilterAction(pk));
  });
};

export const modifyFilter = (dispatch: Dispatch, filter: Filter): Promise<Filter> => {
  const definition = {
    sourceSystemIds: filter.sourceSystemIds,
    tags: filter.tags,
  };
  return api.putFilter(filter.pk, filter.name, definition).then(() => {
    dispatch(modifyFilterAction(filter));
    return filter;
  });
};

export type UseFiltersActionType = {
  createFilter: (filter: Omit<Filter, "pk">) => ReturnType<typeof createFilter>;
  deleteFilter: (pk: Filter["pk"]) => ReturnType<typeof deleteFilter>;
  modifyFilter: (filter: Filter) => ReturnType<typeof modifyFilter>;
};

export function useFilters(): [InitialStateType["filters"], UseFiltersActionType] {
  const {
    state: { filters },
    dispatch,
  } = useContext(AppContext);

  return [
    filters,
    {
      createFilter: (filter: Omit<Filter, "pk">) => createFilter(dispatch, filter),
      deleteFilter: (pk: Filter["pk"]) => deleteFilter(dispatch, pk),
      modifyFilter: (filter: Filter) => modifyFilter(dispatch, filter),
    },
  ];
}
