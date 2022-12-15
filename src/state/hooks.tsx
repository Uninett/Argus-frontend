import {useCallback, useContext} from "react";

import type {AutoUpdateMethod, User, Token} from "../api/types.d";

import {
  ApiState,
  setAutoUpdateMethod,
  setHasConnectionProblems,
  unsetHasConnectionProblems,
  setOngoingBulkUpdate,
  unsetOngoingBulkUpdate,
} from "../state/reducers/apistate";

import { UserStateType, loginUser, loginTokenUser, logoutUser } from "../state/reducers/user";

import { AppContext } from "../state/contexts";
import { setTimeframe, TimeframeStateType } from "./reducers/timeframe";
import {
  changeUrl,
  initTicketState,
  invalidUrl,
  manuallyEditTicket,
  resetTicketState,
  TicketStateType
} from "./reducers/ticketurl";

export type UseApiStateActionType = {
  setAutoUpdateMethod: (method: AutoUpdateMethod) => void;
  setHasConnectionProblems: () => void;
  unsetHasConnectionProblems: () => void;
  setOngoingBulkUpdate: () => void;
  unsetOngoingBulkUpdate: () => void;
};

export const useApiState = (): [ApiState, UseApiStateActionType] => {
  const {
    state: { apiState },
    dispatch,
  } = useContext(AppContext);

  const setAutoUpdateMethodCallback = useCallback((method: AutoUpdateMethod) => dispatch(setAutoUpdateMethod(method)), [
    dispatch,
  ]);
  const setHasConnectionProblemsCallback = useCallback(() => dispatch(setHasConnectionProblems()), [dispatch]);
  const unsetHasConnectionProblemsCallback = useCallback(() => dispatch(unsetHasConnectionProblems()), [dispatch]);
  const setOngoingBulkUpdateCallback = useCallback(() => dispatch(setOngoingBulkUpdate()), [dispatch]);
  const unsetOngoingBulkUpdateCallback = useCallback(() => dispatch(unsetOngoingBulkUpdate()), [dispatch]);

  return [
    apiState,
    {
      setAutoUpdateMethod: setAutoUpdateMethodCallback,
      setHasConnectionProblems: setHasConnectionProblemsCallback,
      unsetHasConnectionProblems: unsetHasConnectionProblemsCallback,
      setOngoingBulkUpdate: setOngoingBulkUpdateCallback,
      unsetOngoingBulkUpdate: unsetOngoingBulkUpdateCallback,
    },
  ];
};

/*
 * User
 */
export type UseUserActionType = {
  login: (user: User) => void;
  logout: () => void;
  loginToken: (user: User, token: Token) => void;
};

export const useUser = (): [UserStateType, UseUserActionType] => {
  const {
    state: { user },
    dispatch,
  } = useContext(AppContext);

  const loginCallback = useCallback((user: User) => dispatch(loginUser(user)), [dispatch]);
  const logoutCallback = useCallback(() => dispatch(logoutUser()), [dispatch]);
  const loginTokenCallback = useCallback((user: User, token: Token) => dispatch(loginTokenUser({ user, token })), [
    dispatch,
  ]);

  return [
    user,
    {
      login: loginCallback,
      logout: logoutCallback,
      loginToken: loginTokenCallback,
    },
  ];
};

// Time filter
export type UseTimeframeActionType = {
  setTimeframe: (value: number) => void;
};

export const useTimeframe = (): [TimeframeStateType, UseTimeframeActionType] => {
  const {
    state: { timeframe },
    dispatch,
  } = useContext(AppContext);

  const setTimeframeCallback = useCallback((value: number) => dispatch(setTimeframe(value)), [dispatch]);
  return [
    timeframe,
    {
      setTimeframe: setTimeframeCallback,
    },
  ];
};

// Ticket actions
export type UseTicketActionType = {
  initTicketState: (ticketUrl: string | undefined) => void;
  changeUrl: (url: string | undefined) => void;
  invalidUrl: () => void;
  manuallyEditTicket: () => void;
  resetTicketState: (url: string | undefined | null) => void;
};

export const useTicket = (): [TicketStateType, UseTicketActionType] => {
  const {
    state: { ticketState },
    dispatch,
  } = useContext(AppContext);

  const initTicketStateCallback = useCallback((ticketUrl: string | undefined) => dispatch(initTicketState(ticketUrl)), [dispatch]);
  const changeUrlCallback = useCallback((url: string | undefined) => dispatch(changeUrl(url)), [dispatch]);
  const invalidUrlCallback = useCallback(() => dispatch(invalidUrl()), [dispatch]);
  const manuallyEditTicketCallback = useCallback(() => dispatch(manuallyEditTicket()), [dispatch]);
  const resetTicketStateCallback = useCallback((url: string | undefined | null) => dispatch(resetTicketState(url)), [dispatch]);

  return [
    ticketState,
    {
      initTicketState: initTicketStateCallback,
      changeUrl: changeUrlCallback,
      invalidUrl: invalidUrlCallback,
      manuallyEditTicket: manuallyEditTicketCallback,
      resetTicketState: resetTicketStateCallback,
    },
  ];
};
