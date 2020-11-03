import { createContext } from "react";

import { Filter, SourceSystem } from "../../api";

export type FiltersContextType = {
  loadingPreview: number | boolean; // pk
  savingFilter: number | boolean; // pk
  deletingFilter: number | undefined; // pk
  editingFilter: Filter | undefined;

  sources: SourceSystem[];
  sourceFromId: (id: number) => SourceSystem | undefined;
  sourceFromName: (name: string) => SourceSystem | undefined;

  filterExists: (name: string) => boolean;
};

export const DEFAULT_FILTERS_CONTEXT_VALUE = {
  loadingPreview: false,
  savingFilter: false,
  deletingFilter: undefined,
  editingFilter: undefined,

  sources: [],
  sourceFromId: () => undefined,
  sourceFromName: () => undefined,

  filterExists: () => false,
};

export const FiltersContext = createContext<FiltersContextType>(DEFAULT_FILTERS_CONTEXT_VALUE);
