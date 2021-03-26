import React, { useCallback, useContext } from "react";
import type {
  Filter,
  FilterSuccessResponse,
  Incident,
  IncidentsFilterOptions,
  Event,
  AcknowledgementBody,
  Acknowledgement,
  AutoUpdateMethod,
  User,
  Token,
} from "../api/types.d";

import api from "../api";
import { InitialStateType, ActionsType } from "../contexts";
import {
  createFilter as createFilterAction,
  deleteFilter as deleteFilterAction,
  modifyFilter as modifyFilterAction,
  loadAllFilters as loadAllFiltersAction,
} from "../reducers/filter";

import { IncidentsFilter } from "../components/incidenttable/FilteredIncidentTable";
import { Tag } from "../components/tagselector";
import { IncidentsStateType, useIncidentsContext } from "../components/incidentsprovider";

import {
  ApiState,
  setAutoUpdateMethod,
  setHasConnectionProblems,
  unsetHasConnectionProblems,
} from "../reducers/apistate";

import { UserStateType, loginUser, loginTokenUser, logoutUser } from "../reducers/user";

import { AppContext } from "../contexts";

type Dispatch = React.Dispatch<ActionsType>;

export const createFilter = (dispatch: Dispatch, filter: Omit<Filter, "pk">): Promise<Filter> => {
  const definition = {
    sourceSystemIds: filter.sourceSystemIds,
    tags: filter.tags,
  };
  return api.postFilter(filter.name, definition).then((response: FilterSuccessResponse) => {
    const { name, pk } = response;
    const newFilter = { ...filter, name, pk };
    dispatch(createFilterAction(newFilter));
    return newFilter;
  });
};

export const deleteFilter = (dispatch: Dispatch, pk: Filter["pk"]): Promise<void> => {
  return api.deleteFilter(pk).then(() => {
    dispatch(deleteFilterAction(pk));
  });
};

export const modifyFilter = (dispatch: Dispatch, filter: Filter): Promise<Filter> => {
  const definition = {
    sourceSystemIds: filter.sourceSystemIds,
    tags: filter.tags,
  };
  return api.putFilter(filter.pk, filter.name, definition).then(() => {
    dispatch(modifyFilterAction(filter));
    return filter;
  });
};

export const loadAllFilters = (dispatch: Dispatch): Promise<Filter[]> => {
  return api.getAllFilters().then((filters: Filter[]) => {
    dispatch(loadAllFiltersAction(filters));
    return filters;
  });
};

export type UseFiltersActionType = {
  createFilter: (filter: Omit<Filter, "pk">) => ReturnType<typeof createFilter>;
  deleteFilter: (pk: Filter["pk"]) => ReturnType<typeof deleteFilter>;
  modifyFilter: (filter: Filter) => ReturnType<typeof modifyFilter>;
  loadAllFilters: () => ReturnType<typeof loadAllFilters>;
};

export function useFilters(): [InitialStateType["filters"], UseFiltersActionType] {
  const {
    state: { filters },
    dispatch,
  } = useContext(AppContext);

  return [
    filters,
    {
      createFilter: (filter: Omit<Filter, "pk">) => createFilter(dispatch, filter),
      deleteFilter: (pk: Filter["pk"]) => deleteFilter(dispatch, pk),
      modifyFilter: (filter: Filter) => modifyFilter(dispatch, filter),
      loadAllFilters: () => loadAllFilters(dispatch),
    },
  ];
}

const filterToQueryFilter = (filter: Omit<IncidentsFilter, "sources">): IncidentsFilterOptions => {
  return {
    acked: filter.showAcked ? undefined : false,
    open: filter.show === "both" ? undefined : filter.show === "open",
    // stateful:
    sourceSystemIds: filter.sourcesById,
    tags: filter.tags.map((tag: Tag) => tag.original),
  };
};

export type UseIncidentsActionType = {
  loadIncidentsFiltered: (filter: Omit<IncidentsFilter, "sources">) => Promise<Incident[]>;
  closeIncident: (pk: Incident["pk"], description?: string) => Promise<Event>;
  reopenIncident: (pk: Incident["pk"], description?: string) => Promise<Event>;
  acknowledgeIncident: (pk: Incident["pk"], ackBody: AcknowledgementBody) => Promise<Acknowledgement>;
};

export const useIncidents = (): [IncidentsStateType, UseIncidentsActionType] => {
  const [state, { loadAllIncidents, closeIncident, reopenIncident, acknowledgeIncident }] = useIncidentsContext();

  const loadIncidentsFiltered = useCallback(
    (filter: Omit<IncidentsFilter, "sources">) => {
      return api.getAllIncidentsFiltered(filterToQueryFilter(filter)).then((incidents: Incident[]) => {
        loadAllIncidents(incidents);
        return incidents;
      });
    },
    [loadAllIncidents],
  );

  const closeIncidentCallback = useCallback(
    (pk: Incident["pk"], description?: string) =>
      api.postIncidentCloseEvent(pk, description).then((closeEvent: Event) => {
        closeIncident(pk);
        return closeEvent;
      }),
    [closeIncident],
  );

  const reopenIncidentCallback = useCallback(
    (pk: Incident["pk"]) =>
      api.postIncidentReopenEvent(pk).then((closeEvent: Event) => {
        reopenIncident(pk);
        return closeEvent;
      }),
    [reopenIncident],
  );

  const acknowledgeIncidentCallback = useCallback(
    (pk: Incident["pk"], ackBody: AcknowledgementBody) =>
      api.postAck(pk, ackBody).then((ack: Acknowledgement) => {
        acknowledgeIncident(pk);
        return ack;
      }),
    [acknowledgeIncident],
  );

  return [
    state,
    {
      loadIncidentsFiltered,
      closeIncident: closeIncidentCallback,
      reopenIncident: reopenIncidentCallback,
      acknowledgeIncident: acknowledgeIncidentCallback,
    },
  ];
};

/*
 * TODO: Move somewhere else
 */
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
