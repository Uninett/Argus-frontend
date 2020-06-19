import moment from "moment";
import { Alert } from "./api";

export interface AlertWithFormattedTimestamp extends Alert {
  formattedTimestamp: string;
}

export function alertWithFormattedTimestamp(
  alert: Alert
): AlertWithFormattedTimestamp {
  return {
    ...alert,
    formattedTimestamp: moment(alert.timestamp).format("YYYY.MM.DD  hh:mm:ss"),
  };
}
