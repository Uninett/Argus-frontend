import React, { createContext, useReducer } from "react";

import { Filter } from "./api";
import { filterReducer, FilterActions } from "./reducers/filter";
import { initialUserState, userReducer, UserActions, UserStateType } from "./reducers/user";

export type InitialStateType = {
  // List of all filters that the currently
  // logged in user has access to.
  filters: Filter[];
  user: UserStateType;
};

const initialState: InitialStateType = {
  filters: [],
  user: initialUserState,
};

export type ActionsType = FilterActions | UserActions /*  | AnotherAction ... */;

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<ActionsType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = ({ filters, user }: InitialStateType, action: ActionsType) => ({
  filters: filterReducer(filters, action as FilterActions),
  user: userReducer(user, action as UserActions),
});

const AppProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
