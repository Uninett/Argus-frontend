import { ActionMap, makeActionWithoutPayload } from "./common";

export type ApiState = {
  hasConnectionProblems: boolean;
};

export enum ApiStateType {
  SET_HAS_CONNECTION_PROBLEMS = "SET_HAS_CONNECTION_PROBLEMS",
  UNSET_HAS_CONNECTION_PROBLEMS = "UNSET_HAS_CONNECTION_PROBLEMS",
}

type ApiStatePayload = {
  [ApiStateType.SET_HAS_CONNECTION_PROBLEMS]: undefined;
  [ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS]: undefined;
};

export const initialApiState: ApiState = {
  hasConnectionProblems: false,
};

export type ApiStateActions = ActionMap<ApiStatePayload>[keyof ActionMap<ApiStatePayload>];
export const apiStateReducer = (state: ApiState, action: ApiStateActions) => {
  switch (action.type) {
    case ApiStateType.SET_HAS_CONNECTION_PROBLEMS:
      return {
        hasConnectionProblems: true,
      };
    case ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS:
      return {
        hasConnectionProblems: false,
      };
    default:
      return state;
  }
};

export const setHasConnectionProblems = makeActionWithoutPayload<ApiStateType.SET_HAS_CONNECTION_PROBLEMS>(
  ApiStateType.SET_HAS_CONNECTION_PROBLEMS,
);
export const unsetHasConnectionProblems = makeActionWithoutPayload<ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS>(
  ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS,
);
