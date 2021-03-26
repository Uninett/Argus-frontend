import React, { useEffect, useReducer, useContext, createContext } from "react";

import { IncidentsFilter } from "../components/incidenttable/FilteredIncidentTable";
import type { Filter, AutoUpdateMethod } from "../api/types.d";
import { Tag, originalToTag } from "../components/tagselector";

// Store
import { ActionMap } from "../reducers/common";
import { SELECTED_FILTER } from "../localstorageconsts";

// Utils
import { fromLocalStorageOrDefault, saveToLocalStorage } from "../utils";

export type SelectedFilterStateType = {
  // Optionally selected using drop-down
  existingFilter: Filter | undefined;

  // Additional settings that the user has set
  tags: Tag[];
  sourcesById: number[];

  showAcked: boolean;
  // autoUpdate: AutoUpdateMethod;
  show: "open" | "closed" | "both";

  // The resulting incidents filter
  incidentsFilter: IncidentsFilter;
};

export type SelectedFilterProperties = Partial<Omit<SelectedFilterStateType, "existingFilter" | "filter">>;

const initialSelectedFilter: SelectedFilterStateType = {
  existingFilter: undefined,

  tags: [],
  sourcesById: [],

  showAcked: false,
  // autoUpdate: "realtime", // TODO: this should not be here...
  show: "open",

  incidentsFilter: {
    showAcked: false,
    show: "open",
    tags: [],
    sourcesById: undefined,
    sources: "AllSources",
    // autoUpdate: "realtime",
  },
};

enum SelectedFilterType {
  SetExistingFilter = "SET_EXISTING_FILTER",
  UnsetExistingFilter = "UNSET_EXISTING_FILTER",
  SetSelectedFilter = "SET_SELECTED_FILTER",
}

export type SelectedFilterPayload = {
  [SelectedFilterType.SetExistingFilter]: Filter;
  [SelectedFilterType.UnsetExistingFilter]: undefined;
  [SelectedFilterType.SetSelectedFilter]: SelectedFilterProperties;
};

export type SelectedFilterActions = ActionMap<SelectedFilterPayload>[keyof ActionMap<SelectedFilterPayload>];
export const selectedFilterReducer = (
  state: SelectedFilterStateType,
  action: SelectedFilterActions,
): SelectedFilterStateType => {
  function arrayEquals<T>(p: T[], q: T[]): boolean {
    if (p.length !== q.length) return false;
    let i = 0;
    while (i < p.length) {
      if (p[i] !== q[i]) return false;
      i++;
    }
    return true;
  }

  switch (action.type) {
    case SelectedFilterType.SetSelectedFilter: {
      const selected = action.payload;
      const { showAcked, /* autoUpdate, */ show } = { ...state, ...selected };

      let unset = false;
      if (selected.tags && !arrayEquals(selected.tags, state.incidentsFilter.tags)) {
        unset = true;
      }
      if (
        selected.sourcesById &&
        ((state.incidentsFilter.sourcesById && !arrayEquals(selected.sourcesById, state.incidentsFilter.sourcesById)) ||
          !state.incidentsFilter.sourcesById)
      ) {
        unset = true;
      }

      const tags: Tag[] = selected.tags ? selected.tags : state.incidentsFilter.tags;
      const sourcesById: number[] | undefined = selected.sourcesById
        ? selected.sourcesById
        : state.incidentsFilter.sourcesById;
      const updated = { tags, sourcesById, showAcked, /* autoUpdate, */ show };

      const incidentsFilter: IncidentsFilter = {
        sources: undefined,
        ...updated,
      };

      const nextState = { ...state, ...selected, incidentsFilter };
      if (unset) {
        return { ...nextState, existingFilter: undefined };
      }
      return nextState;
    }

    case SelectedFilterType.UnsetExistingFilter: {
      const { showAcked, /* autoUpdate, */ show } = state;
      const updated = { tags: [], sourcesById: [], showAcked, /* autoUpdate, */ show };
      const incidentsFilter: IncidentsFilter = { ...updated, sources: undefined };
      return { ...state, ...updated, existingFilter: undefined, incidentsFilter };
    }

    case SelectedFilterType.SetExistingFilter: {
      const existingFilter = action.payload;
      const { showAcked, /* autoUpdate, */ show } = state;
      const updated = { tags: [], sourcesById: [], showAcked, /* autoUpdate, */ show };

      const incidentsFilter: IncidentsFilter = {
        sources: undefined,
        ...updated,
        tags: existingFilter.tags.map(originalToTag),
        sourcesById: existingFilter.sourceSystemIds,
      };

      return {
        ...state,
        ...updated,
        existingFilter,
        incidentsFilter,
      };
    }
    default:
      throw new Error(`Unexpected action type ${action}`);
  }
};

export const SelectedFilterContext = createContext<{
  state: SelectedFilterStateType;
  dispatch: React.Dispatch<SelectedFilterActions>;
}>({
  state: initialSelectedFilter,
  dispatch: () => null,
});

export const SelectedFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(
    selectedFilterReducer,
    fromLocalStorageOrDefault<SelectedFilterStateType>(SELECTED_FILTER, initialSelectedFilter),
  );

  useEffect(() => {
    // Save to local storage
    saveToLocalStorage<SelectedFilterStateType>(SELECTED_FILTER, state);
  }, [state]);

  return <SelectedFilterContext.Provider value={{ state, dispatch }}>{children}</SelectedFilterContext.Provider>;
};

export const useSelectedFilter = (): [
  SelectedFilterStateType,
  {
    setExistingFilter: (filter: Filter) => void;
    unsetExistingFilter: () => void;
    setSelectedFilter: (filter: SelectedFilterProperties) => void;
  },
] => {
  const { state, dispatch } = useContext(SelectedFilterContext);
  return [
    state,
    {
      setExistingFilter: (filter: Filter) => dispatch({ type: SelectedFilterType.SetExistingFilter, payload: filter }),
      unsetExistingFilter: () => dispatch({ type: SelectedFilterType.UnsetExistingFilter }),
      setSelectedFilter: (filter: SelectedFilterProperties) =>
        dispatch({ type: SelectedFilterType.SetSelectedFilter, payload: filter }),
    },
  ];
};

export default SelectedFilterProvider;
