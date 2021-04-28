import { ActionMap, makeActionWithoutPayload, makeAction } from "./common";

import type { AutoUpdateMethod } from "../api/types.d";

export type ApiState = {
  autoUpdateMethod: AutoUpdateMethod;
  hasConnectionProblems: boolean;
};

export enum ApiStateType {
  SET_AUTO_UPDATE_METHOD = "SET_AUTO_UPDATE_METHOD",
  SET_HAS_CONNECTION_PROBLEMS = "SET_HAS_CONNECTION_PROBLEMS",
  UNSET_HAS_CONNECTION_PROBLEMS = "UNSET_HAS_CONNECTION_PROBLEMS",
}

type ApiStatePayload = {
  [ApiStateType.SET_AUTO_UPDATE_METHOD]: AutoUpdateMethod;
  [ApiStateType.SET_HAS_CONNECTION_PROBLEMS]: undefined;
  [ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS]: undefined;
};

export const initialApiState: ApiState = {
  autoUpdateMethod: "realtime",
  hasConnectionProblems: false,
};

export type ApiStateActions = ActionMap<ApiStatePayload>[keyof ActionMap<ApiStatePayload>];
export const apiStateReducer = (state: ApiState, action: ApiStateActions): ApiState => {
  switch (action.type) {
    case ApiStateType.SET_AUTO_UPDATE_METHOD:
      return {
        ...state,
        autoUpdateMethod: "realtime",
      };
    case ApiStateType.SET_HAS_CONNECTION_PROBLEMS:
      return {
        ...state,
        hasConnectionProblems: true,
      };
    case ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS:
      return {
        ...state,
        hasConnectionProblems: false,
      };
    default:
      return state;
  }
};

export const setAutoUpdateMethod = makeAction<ApiStateType.SET_AUTO_UPDATE_METHOD, AutoUpdateMethod>(
  ApiStateType.SET_AUTO_UPDATE_METHOD,
);
export const setHasConnectionProblems = makeActionWithoutPayload<ApiStateType.SET_HAS_CONNECTION_PROBLEMS>(
  ApiStateType.SET_HAS_CONNECTION_PROBLEMS,
);
export const unsetHasConnectionProblems = makeActionWithoutPayload<ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS>(
  ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS,
);
