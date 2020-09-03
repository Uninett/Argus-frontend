import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Incident, PhoneNumber, PhoneNumberPK } from ".";
// TODO: fix this
import { incidentWithFormattedTimestamp, IncidentWithFormattedTimestamp } from "../utils";
import {
  ApiErrorType,
  NotificationProfile,
  NotificationProfilePK,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
} from "../api";
import { toMap, pkGetter } from "../utils";

type UsePromiseReturnType<R> = {
  result: R | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorType | undefined;
};

export function createUsePromise<T, R = T>(mapper: (input: T) => R, onResult?: (result: R) => void) {
  const usePromise = (
    initialPromise?: Promise<T>,
  ): [UsePromiseReturnType<R>, Dispatch<SetStateAction<Promise<T> | undefined>>] => {
    const [promise, setPromise] = useState<Promise<T> | undefined>(initialPromise);
    const [result, setResult] = useState<R | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState(undefined);

    useEffect(() => {
      (async () => {
        if (promise === undefined) return;

        setIsLoading(true);
        setIsError(false);
        setError(undefined);

        try {
          const res: T = await promise;
          const mapped: R = mapper(res);
          setResult(mapped);
          if (onResult) onResult(mapped);
        } catch (error) {
          setIsError(true);
          setError(error);
        }
        setIsLoading(false);
      })();
    }, [promise]);

    const returnValues: UsePromiseReturnType<R> = { result, isLoading, isError, error };
    return [returnValues, setPromise];
  };
  return usePromise;
}

function asMap<K extends string | number, V extends { pk: K }>(elems: V[]): Map<K, V> {
  return toMap<K, V>(elems, pkGetter);
}

export const useApiIncidents = createUsePromise<Incident[], IncidentWithFormattedTimestamp[]>(
  (incidents: Incident[]): IncidentWithFormattedTimestamp[] => incidents.map(incidentWithFormattedTimestamp),
  () => undefined,
);

export const useApiNotificationProfiles = (
  onResult?: (result: Map<NotificationProfilePK, NotificationProfile>) => void,
) => createUsePromise<NotificationProfile[], Map<NotificationProfilePK, NotificationProfile>>(asMap, onResult);

export const useApiFilters = (onResult?: (result: Map<FilterPK, Filter>) => void) =>
  createUsePromise<Filter[], Map<FilterPK, Filter>>(asMap, onResult);

export const useApiTimeslots = (onResult?: (result: Map<TimeslotPK, Timeslot>) => void) =>
  createUsePromise<Timeslot[], Map<TimeslotPK, Timeslot>>(asMap, onResult);

export const useApiPhoneNumbers = (onResult?: (result: Map<PhoneNumberPK, PhoneNumber>) => void) =>
  createUsePromise<PhoneNumber[], Map<PhoneNumberPK, PhoneNumber>>(asMap, onResult);
