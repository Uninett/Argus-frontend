import React, { useContext } from "react";
import api, { Filter } from "../api";
import { InitialStateType, ActionsType } from "../contexts";
import { deleteFilter as deleteFilterAction } from "../reducers/filter";

import { AppContext } from "../contexts";

type Dispatch = React.Dispatch<ActionsType>;

export const deleteFilter = (dispatch: Dispatch, pk: Filter["pk"]): Promise<void> => {
  return api.deleteFilter(pk).then(() => {
    dispatch(deleteFilterAction(pk));
  });
};

export type UseFiltersActionType = {
  deleteFilter: (pk: Filter["pk"]) => ReturnType<typeof deleteFilter>;
};

export function useFilters(): [InitialStateType["filters"], UseFiltersActionType] {
  const {
    state: { filters },
    dispatch,
  } = useContext(AppContext);

  return [filters, { deleteFilter: (pk: Filter["pk"]) => deleteFilter(dispatch, pk) }];
}
