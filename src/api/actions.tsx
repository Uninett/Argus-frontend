import React, { useContext } from "react";
import api, { Filter } from "../api";
import { InitialStateType, ActionsType } from "../contexts";
import { deleteFilter as deleteFilterAction, modifyFilter as modifyFilterAction } from "../reducers/filter";

import { AppContext } from "../contexts";

type Dispatch = React.Dispatch<ActionsType>;

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
      deleteFilter: (pk: Filter["pk"]) => deleteFilter(dispatch, pk),
      modifyFilter: (filter: Filter) => modifyFilter(dispatch, filter),
    },
  ];
}
