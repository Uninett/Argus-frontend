import React, { useEffect, useReducer, useContext, createContext } from "react";

import type { Filter, FilterContent } from "../api/types";

// Store
import { ActionMap } from "../state/reducers/common";
import { SELECTED_FILTER } from "../localstorageconsts";

// Utils
import { fromLocalStorageOrDefault, saveToLocalStorage } from "../utils";

export type SelectedFilterStateType = {
  // Optionally selected using drop-down
  existingFilter: Filter | undefined;

  // Additional settings that the user has set
  // tags: Tag[];
  tags: string[];
  sourceSystemIds: number[];

  filterContent: FilterContent;

  // showAcked: boolean;
  // autoUpdate: AutoUpdateMethod;
  // show: "open" | "closed" | "both";

  // The resulting incidents filter
  incidentsFilter: Omit<Filter, "pk" | "name">;
};

const initialSelectedFilter: SelectedFilterStateType = {
  existingFilter: undefined,

  tags: [],
  sourceSystemIds: [],

  // showAcked: false,
  // autoUpdate: "realtime", // TODO: this should not be here...
  // show: "open",
  filterContent: {
    open: true,
    acked: false,
    stateful: undefined,
    maxLevel: 5,
  },

  incidentsFilter: {
    filter: {
      acked: false,
      open: true,
      stateful: undefined,
      maxLevel: 5,
    },
    tags: [],
    sourceSystemIds: [],
    // sources: "AllSources",
    // autoUpdate: "realtime",
  },
};

/*
 * Useful to know about SetExistingFilter:
 * - To be able to differentiate between setting a value to undefined,
 *   for example setting { acked: undefined } such that the we don't filter on
 *   acked, and NOT modifying the value, for example when we pass { open: true },
 *   we don't want the acked filter to be unset. Therefore we use null when
 *   we want to set it to undefined, so that we can use the ... notation.
 */

type NullableAndOptional<T> = { [P in keyof T]: T[P] | null | undefined };

export type SelectedFilterProperties = Partial<
  Omit<SelectedFilterStateType, "existingFilter" | "filter" | "filterContent"> & {
    filterContent: NullableAndOptional<FilterContent>;
  }
>;

// type NullableSelectedFilterProperties = Partial<
//   Exclude<SelectedFilterProperties, "filterContent"> & {
//     filterContent?: NullableAndOptional<FilterContent>;
//   }
// >;

enum SelectedFilterType {
  SetExistingFilter = "SET_EXISTING_FILTER",
  UnsetExistingFilter = "UNSET_EXISTING_FILTER",
  SetSelectedFilter = "SET_SELECTED_FILTER",
}

function oldOrNew<K>(oldObject: K | undefined, newObject: K | undefined | null): K | undefined {
  if (newObject === null) {
    return undefined;
  } else if (newObject === undefined) {
    return oldObject;
  } else {
    return newObject;
  }
}

function mergedFilterContent(state: FilterContent, selected: SelectedFilterProperties["filterContent"]): FilterContent {
  const nextState: FilterContent = { ...state };
  nextState.acked = oldOrNew(state.acked, selected?.acked);
  nextState.open = oldOrNew(state.open, selected?.open);
  nextState.stateful = oldOrNew(state.stateful, selected?.stateful);
  nextState.maxLevel = oldOrNew(state.maxLevel, selected?.maxLevel);
  // console.log("state", state, "selected", selected, "next", nextState);
  return nextState;
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
      // const { filterContent } = { ...state, ...selected };

      let unset = false; // did we do changes so that we need to change the existingFilter to undefined?
      const filterContent: FilterContent = mergedFilterContent(state.filterContent, selected.filterContent);

      if (
        filterContent.acked !== state.filterContent.acked ||
        filterContent.open !== state.filterContent.open ||
        filterContent.stateful !== state.filterContent.stateful ||
        filterContent.maxLevel !== state.filterContent.maxLevel
      ) {
        unset = true;
      } else if (selected.tags && !arrayEquals(selected.tags, state.incidentsFilter.tags)) {
        unset = true;
      } else if (
        selected.sourceSystemIds &&
        ((state.incidentsFilter.sourceSystemIds &&
          !arrayEquals(selected.sourceSystemIds, state.incidentsFilter.sourceSystemIds)) ||
          !state.incidentsFilter.sourceSystemIds)
      ) {
        unset = true;
      }

      const tags: string[] = selected.tags ? selected.tags : state.incidentsFilter.tags;
      const sourceSystemIds: number[] | undefined = selected.sourceSystemIds
        ? selected.sourceSystemIds
        : state.incidentsFilter.sourceSystemIds;

      const updated: Omit<Filter, "pk" | "name"> = { tags, sourceSystemIds, filter: filterContent };

      const nextState = { ...state, ...selected, tags, sourceSystemIds, filterContent, incidentsFilter: updated };

      // console.log("NEXT STATE", nextState);

      if (unset) {
        return { ...nextState, existingFilter: undefined };
      }
      return nextState;
    }

    case SelectedFilterType.UnsetExistingFilter: {
      const { filterContent } = state;
      const updated = { tags: [], sourceSystemIds: [], filterContent };
      const incidentsFilter: Omit<Filter, "pk" | "name"> = { ...updated, sourceSystemIds: [], filter: filterContent };
      return { ...state, ...updated, existingFilter: undefined, incidentsFilter };
    }

    case SelectedFilterType.SetExistingFilter: {
      const existingFilter = action.payload;
      const incidentsFilter: Omit<Filter, "pk" | "name"> = {
        tags: existingFilter.tags,
        sourceSystemIds: existingFilter.sourceSystemIds,
        filter: existingFilter.filter,
      };

      // console.log("setting existing", incidentsFilter);

      return {
        ...state,
        filterContent: existingFilter.filter,
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
  // Function is used to validate the selected filter from LocalStorage. If the filter doesn't match the specified format, the default selected filter will be used instead.
  const validateSelectedFilter = (selectedFilter: SelectedFilterStateType) => {
    return !(
      !selectedFilter.filterContent ||
      !selectedFilter.incidentsFilter ||
      !selectedFilter.sourceSystemIds ||
      !selectedFilter.tags
    );
  };

  const [state, dispatch] = useReducer(
    selectedFilterReducer,
    fromLocalStorageOrDefault<SelectedFilterStateType>(SELECTED_FILTER, initialSelectedFilter, validateSelectedFilter),
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
