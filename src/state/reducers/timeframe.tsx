import { ActionMap, makeAction } from "./common";
import { fromLocalStorageOrDefault } from "../../utils";
import { TIMEFRAME } from "../../localstorageconsts";

export type TimeframeStateType = {
  timeframeInHours: number;
};

export enum TimeframeType {
  SetTimeframe = "SET_TIMEFRAME",
}

type TimeframePayload = {
  [TimeframeType.SetTimeframe]: number;
};

export const initialTimeframeState = {
  timeframeInHours: fromLocalStorageOrDefault(TIMEFRAME, 0),
};

export type TimeframeActions = ActionMap<TimeframePayload>[keyof ActionMap<TimeframePayload>];
export const timeframeReducer = (state: TimeframeStateType, action: TimeframeActions) => {
  switch (action.type) {
    case TimeframeType.SetTimeframe:
      return {
        timeframeInHours: action.payload,
      };
    default:
      return state;
  }
};

export const setTimeframe = makeAction<TimeframeType.SetTimeframe, number>(TimeframeType.SetTimeframe);
