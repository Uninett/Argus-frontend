import React, { createContext, useReducer } from "react";

import type { Filter } from "../api/types.d";
import { filterReducer, FilterActions } from "../state/reducers/filter";
import { initialUserState, userReducer, UserActions, UserStateType } from "../state/reducers/user";
import { initialApiState, apiStateReducer, ApiStateActions, ApiState } from "../state/reducers/apistate";
import { initialTimeframeState, TimeframeActions, timeframeReducer, TimeframeStateType } from "./reducers/timeframe";
import {initialTicketState, TicketActions, ticketReducer, TicketStateType} from "./reducers/ticketurl";
import {
  DestinationsActions,
  destinationsReducer,
  DestinationsStateType,
  initialDestinationsState
} from "./reducers/destinations";

export type InitialStateType = {
  // List of all filters that the currently
  // logged in user has access to.
  filters: Filter[];
  user: UserStateType;
  apiState: ApiState;
  timeframe: TimeframeStateType;
  ticketState: TicketStateType;
  destinationsState: DestinationsStateType;
};

const initialState: InitialStateType = {
  filters: [],
  user: initialUserState,
  apiState: initialApiState,
  timeframe: initialTimeframeState,
  ticketState: initialTicketState,
  destinationsState: initialDestinationsState,
};

export type ActionsType = FilterActions | UserActions | ApiStateActions | TimeframeActions | TicketActions | DestinationsActions /*  | AnotherAction ... */;
const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<ActionsType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = ({ filters, user, apiState, timeframe, ticketState, destinationsState }: InitialStateType, action: ActionsType) => ({
  filters: filterReducer(filters, action as FilterActions),
  user: userReducer(user, action as UserActions),
  apiState: apiStateReducer(apiState, action as ApiStateActions),
  timeframe: timeframeReducer(timeframe, action as TimeframeActions),
  ticketState: ticketReducer(ticketState, action as TicketActions),
  destinationsState: destinationsReducer(destinationsState, action as DestinationsActions),
});

const AppProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
