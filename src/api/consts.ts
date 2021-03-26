import type { TimeRecurrenceDay, TimeRecurrenceDayName } from "./types.d";

export const TIME_RECURRENCE_DAY_IN_ORDER: TimeRecurrenceDay[] = [1, 2, 3, 4, 5, 6, 7];

export const TimeRecurrenceDayNameMap: Record<TimeRecurrenceDay, TimeRecurrenceDayName> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const TimeRecurrenceNameDayMap: Record<TimeRecurrenceDayName, TimeRecurrenceDay> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};
