import { ActionMap, makeActionWithoutPayload, makeAction } from "./common";

import type { AutoUpdateMethod } from "../../api/types.d";
import { fromLocalStorageOrDefault } from "../../utils";
import { AUTO_UPDATE_METHOD } from "../../localstorageconsts";

export type ApiState = {
  autoUpdateMethod: AutoUpdateMethod;
  hasConnectionProblems: boolean;
  isOngoingBulkUpdate: boolean;
};

export enum ApiStateType {
  SET_AUTO_UPDATE_METHOD = "SET_AUTO_UPDATE_METHOD",
  SET_HAS_CONNECTION_PROBLEMS = "SET_HAS_CONNECTION_PROBLEMS",
  UNSET_HAS_CONNECTION_PROBLEMS = "UNSET_HAS_CONNECTION_PROBLEMS",
  SET_ONGOING_BULK_UPDATE = "SET_ONGOING_BULK_UPDATE",
  UNSET_ONGOING_BULK_UPDATE = "UNSET_ONGOING_BULK_UPDATE",
}

type ApiStatePayload = {
  [ApiStateType.SET_AUTO_UPDATE_METHOD]: AutoUpdateMethod;
  [ApiStateType.SET_HAS_CONNECTION_PROBLEMS]: undefined;
  [ApiStateType.UNSET_HAS_CONNECTION_PROBLEMS]: undefined;
  [ApiStateType.SET_ONGOING_BULK_UPDATE]: undefined;
  [ApiStateType.UNSET_ONGOING_BULK_UPDATE]: undefined;
};

export const initialApiState: ApiState = {
  autoUpdateMethod: fromLocalStorageOrDefault(AUTO_UPDATE_METHOD, "interval"),
  hasConnectionProblems: false,
  isOngoingBulkUpdate: false,
};

export type ApiStateActions = ActionMap<ApiStatePayload>[keyof ActionMap<ApiStatePayload>];
export const apiStateReducer = (state: ApiState, action: ApiStateActions): ApiState => {
  switch (action.type) {
    case ApiStateType.SET_AUTO_UPDATE_METHOD:
      return {
        ...state,
        autoUpdateMethod: action.payload,
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
    case ApiStateType.SET_ONGOING_BULK_UPDATE:
      return {
        ...state,
        isOngoingBulkUpdate: true,
      };
    case ApiStateType.UNSET_ONGOING_BULK_UPDATE:
      return {
        ...state,
        isOngoingBulkUpdate: false,
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
export const setOngoingBulkUpdate = makeActionWithoutPayload<ApiStateType.SET_ONGOING_BULK_UPDATE>(
    ApiStateType.SET_ONGOING_BULK_UPDATE,
);
export const unsetOngoingBulkUpdate = makeActionWithoutPayload<ApiStateType.UNSET_ONGOING_BULK_UPDATE>(
    ApiStateType.UNSET_ONGOING_BULK_UPDATE,
);
