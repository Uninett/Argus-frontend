import React, { useReducer, useContext, createContext } from "react";

import { IncidentsFilter, AutoUpdate } from "../components/incidenttable/FilteredIncidentTable";
import { Filter } from "../api";
import { Tag, originalToTag } from "../components/tagselector";

// Store
import { ActionMap } from "../reducers/common";

// XXX - move somewhere else
export type SelectedFilterStateType = {
  // Optionally selected using drop-down
  existingFilter: Filter | undefined;

  // Additional settings that the user has set
  tags: Tag[];
  sourcesById: number[];

  showAcked: boolean;
  autoUpdate: AutoUpdate;
  show: "open" | "closed" | "both";

  // The resulting incidents filter
  filter: IncidentsFilter;
};

const initialSelectedFilter: SelectedFilterStateType = {
  existingFilter: undefined,

  tags: [],
  sourcesById: [],

  showAcked: false,
  // TODO: this should not be here...
  autoUpdate: "realtime",
  show: "open",

  filter: {
    showAcked: false,
    show: "open",
    tags: [],
    sourcesById: undefined,
    sources: "AllSources",
    autoUpdate: "realtime",
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
  [SelectedFilterType.SetSelectedFilter]: Filter;
};

export type SelectedFilterActions = ActionMap<SelectedFilterPayload>[keyof ActionMap<SelectedFilterPayload>];
export const selectedFilterReducer = (
  state: SelectedFilterStateType,
  action: SelectedFilterActions,
): SelectedFilterStateType => {
  switch (action.type) {
    case SelectedFilterType.SetSelectedFilter: {
      const selected = action.payload;
      const { tags, sourceSystemIds } = selected;
      const { showAcked, autoUpdate, show } = { ...state, ...selected };
      const combinedTags = tags.map(originalToTag);

      const filter: IncidentsFilter = {
        tags: combinedTags,
        sources: undefined,
        sourcesById: sourceSystemIds,
        showAcked,
        autoUpdate,
        show,
      };
      return { ...state, filter };
    }
    case SelectedFilterType.UnsetExistingFilter: {
      const { tags, sourcesById, showAcked, autoUpdate, show } = state;
      const filter: IncidentsFilter = { tags, sources: undefined, sourcesById, showAcked, autoUpdate, show };
      return { ...state, existingFilter: undefined, filter };
    }
    case SelectedFilterType.SetExistingFilter: {
      const existingFilter = action.payload;
      const { tags, sourcesById, showAcked, autoUpdate, show } = state;

      // TODO: deal with duplicate tags
      const filter: IncidentsFilter = {
        tags: [...tags, ...existingFilter.tags.map(originalToTag)],
        sources: undefined, // ???
        sourcesById: [...sourcesById, ...existingFilter.sourceSystemIds],
        showAcked,
        autoUpdate,
        show,
      };

      return { ...state, existingFilter, filter };
    }
    default:
      throw new Error(`Unexpected action type ${action.type}`);
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
  const [state, dispatch] = useReducer(selectedFilterReducer, initialSelectedFilter);

  return <SelectedFilterContext.Provider value={{ state, dispatch }}>{children}</SelectedFilterContext.Provider>;
};

export const useSelectedFilter = (): [
  SelectedFilterStateType,
  {
    setExistingFilter: (filter: Filter) => void;
    unsetExistingFilter: () => void;
    setSelectedFilter: (filter: Filter) => void;
  },
] => {
  const { state, dispatch } = useContext(SelectedFilterContext);
  return [
    state,
    {
      setExistingFilter: (filter: Filter) => dispatch({ type: SelectedFilterType.SetExistingFilter, payload: filter }),
      unsetExistingFilter: () => dispatch({ type: SelectedFilterType.UnsetExistingFilter }),
      setSelectedFilter: (filter: Filter) => dispatch({ type: SelectedFilterType.SetSelectedFilter, payload: filter }),
    },
  ];
};

export default SelectedFilterProvider;
