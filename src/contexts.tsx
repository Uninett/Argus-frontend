import React, { createContext, useReducer } from "react";

import { Filter } from "./api";
import { filterReducer, FilterActions } from "./reducers/filter";

export type InitialStateType = {
  // List of all filters that the currently
  // logged in user has access to.
  filters: Filter[];
};

const initialState: InitialStateType = {
  filters: [],
};

type ActionsType = FilterActions /* | OtherAction | AnotherActoin ... */;

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<ActionsType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = ({ filters }: InitialStateType, action: ActionsType) => ({
  filters: filterReducer(filters, action),
});

const AppProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
