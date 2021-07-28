import React, { createContext, useReducer } from "react";

import type { Filter } from "../api/types.d";
import { filterReducer, FilterActions } from "../state/reducers/filter";
import { initialUserState, userReducer, UserActions, UserStateType } from "../state/reducers/user";
import { initialApiState, apiStateReducer, ApiStateActions, ApiState } from "../state/reducers/apistate";
import { initialTimeframeState, TimeframeActions, timeframeReducer, TimeframeStateType } from "./reducers/timeframe";

export type InitialStateType = {
  // List of all filters that the currently
  // logged in user has access to.
  filters: Filter[];
  user: UserStateType;
  apiState: ApiState;
  timeframe: TimeframeStateType;
};

const initialState: InitialStateType = {
  filters: [],
  user: initialUserState,
  apiState: initialApiState,
  timeframe: initialTimeframeState,
};

export type ActionsType = FilterActions | UserActions | ApiStateActions | TimeframeActions /*  | AnotherAction ... */;

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<ActionsType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = ({ filters, user, apiState, timeframe }: InitialStateType, action: ActionsType) => ({
  filters: filterReducer(filters, action as FilterActions),
  user: userReducer(user, action as UserActions),
  apiState: apiStateReducer(apiState, action as ApiStateActions),
  timeframe: timeframeReducer(timeframe, action as TimeframeActions),
});

const AppProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
