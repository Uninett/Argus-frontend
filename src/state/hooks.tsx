import { useCallback, useContext } from "react";

import type { AutoUpdateMethod, User, Token } from "../api/types.d";

import {
  ApiState,
  setAutoUpdateMethod,
  setHasConnectionProblems,
  unsetHasConnectionProblems,
} from "../state/reducers/apistate";

import { UserStateType, loginUser, loginTokenUser, logoutUser } from "../state/reducers/user";

import { AppContext } from "../state/contexts";
import { setTimeframe, TimeframeStateType } from "./reducers/timeframe";

export type UseApiStateActionType = {
  setAutoUpdateMethod: (method: AutoUpdateMethod) => void;
  setHasConnectionProblems: () => void;
  unsetHasConnectionProblems: () => void;
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

  return [
    apiState,
    {
      setAutoUpdateMethod: setAutoUpdateMethodCallback,
      setHasConnectionProblems: setHasConnectionProblemsCallback,
      unsetHasConnectionProblems: unsetHasConnectionProblemsCallback,
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
