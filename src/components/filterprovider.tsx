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

export type SelectedFilterProperties = Partial<Omit<SelectedFilterStateType, "existingFilter" | "filter">>;

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
  [SelectedFilterType.SetSelectedFilter]: SelectedFilterProperties;
};

export type SelectedFilterActions = ActionMap<SelectedFilterPayload>[keyof ActionMap<SelectedFilterPayload>];
export const selectedFilterReducer = (
  state: SelectedFilterStateType,
  action: SelectedFilterActions,
): SelectedFilterStateType => {
  const combineTags = (existingTags: string[] | undefined, newTags: Tag[]): Tag[] => {
    const combinedTags: Tag[] = [];
    const seenTag: { [key: string]: boolean } = {};
    newTags.forEach((tag: Tag) => {
      if (tag.original in seenTag) return;
      seenTag[tag.original] = true;
      combinedTags.push(tag);
    });
    if (existingTags) {
      existingTags.forEach((tagString: string) => {
        if (tagString in seenTag) return;
        seenTag[tagString] = true;
        combinedTags.push(originalToTag(tagString));
      });
    }
    return combinedTags;
  };

  const combineSources = (existingSourceIds: number[] | undefined, newSources: number[]): number[] => {
    const combinedSourcesByIds: number[] = [];
    const seenSource: { [key: number]: boolean } = {};
    newSources.forEach((source: number) => {
      if (source in seenSource) return;
      seenSource[source] = true;
      combinedSourcesByIds.push(source);
    });
    if (existingSourceIds) {
      existingSourceIds.forEach((source: number) => {
        if (source in seenSource) return;
        seenSource[source] = true;
        combinedSourcesByIds.push(source);
      });
    }
    return combinedSourcesByIds;
  };

  switch (action.type) {
    case SelectedFilterType.SetSelectedFilter: {
      const selected = action.payload;
      const { tags, sourcesById } = { ...state, ...selected };

      const { showAcked, autoUpdate, show } = { ...state, ...selected };

      // // Combine the tags using the following rules:
      // // 1. Add selected (not from existing filter) tags first
      // // 2. Ignore duplicates.
      const combinedTags: Tag[] = combineTags(state?.existingFilter?.tags, tags);
      const combinedSourcesByIds: number[] = combineSources(state?.existingFilter?.sourceSystemIds, sourcesById);

      const updated = { tags: combinedTags, sourcesById: combinedSourcesByIds, showAcked, autoUpdate, show };

      const filter: IncidentsFilter = {
        sources: undefined,
        ...updated,
      };
      return { ...state, ...selected, filter };
    }

    case SelectedFilterType.UnsetExistingFilter: {
      const { showAcked, autoUpdate, show } = state;
      const updated = { tags: [], sourcesById: [], showAcked, autoUpdate, show };
      const filter: IncidentsFilter = { ...updated, sources: undefined };
      return { ...state, ...updated, existingFilter: undefined, filter };
    }

    case SelectedFilterType.SetExistingFilter: {
      const existingFilter = action.payload;
      console.log("setting existingFilter", existingFilter);

      const { tags, sourcesById, showAcked, autoUpdate, show } = state;

      const combinedTags: Tag[] = combineTags(existingFilter.tags, tags);
      const combinedSourcesByIds: number[] = combineSources(existingFilter.sourceSystemIds, sourcesById);
      console.log("combinedTags", combinedTags);
      console.log("combinedSourcesByIds", combinedSourcesByIds);

      const updated = { tags: combinedTags, sourcesById: combinedSourcesByIds, showAcked, autoUpdate, show };

      const filter: IncidentsFilter = {
        sources: undefined,
        ...updated,
      };

      return {
        ...state,
        ...updated, // TODO: document this
        existingFilter,
        filter,
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
  const [state, dispatch] = useReducer(selectedFilterReducer, initialSelectedFilter);

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
