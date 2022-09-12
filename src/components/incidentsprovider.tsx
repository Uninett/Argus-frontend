import React, { useReducer, useCallback, useContext, createContext } from "react";

// Api
import type { Incident } from "../api/types.d";

// Store
import { ActionMap } from "../state/reducers/common";

type Index = number;

export type IncidentsStateType = {
  incidents: Incident[];

  // lastModified: number in millis since epoch, of last modification
  lastModified: { [pk: number]: number };

  // _indexByPk indexes the incident pk to index in incidents
  _indexByPk: { [pk: number]: Index };

  // Incidents that ever appeared in view in between app refreshes
  storedIncidents: Incident[];
  lastModifiedInStore: { [pk: number]: number };
  _storedIndexByPk: { [pk: number]: Index };
};

const initialIncidentsState: IncidentsStateType = {
  incidents: [],
  lastModified: {},
  _indexByPk: {},
  storedIncidents: [],
  lastModifiedInStore: {},
  _storedIndexByPk: {},
};

export enum IncidentsType {
  StoreAll = "STORE_ALL_INCIDENTS",
  LoadAll = "LOAD_ALL_INCIDENTS",
  ModifyIncident = "MODIFY_INCIDENT",
  RemoveIncident = "REMOVE_INCIDENT",
  AddIncident = "ADD_INCIDENT",
}

export type IncidentsPayload = {
  [IncidentsType.StoreAll]: Incident[];
  [IncidentsType.LoadAll]: Incident[];
  [IncidentsType.ModifyIncident]: Incident;
  [IncidentsType.RemoveIncident]: Incident["pk"];
  [IncidentsType.AddIncident]: Incident;
};

export type IncidentsActions = ActionMap<IncidentsPayload>[keyof ActionMap<IncidentsPayload>];

export const createIncidentsIndex = (incidents: Incident[]): { [pk: number]: Index } => {
  const mapping: { [pk: number]: Index } = {};
  incidents.forEach((incident: Incident, index: number) => {
    mapping[incident.pk] = index;
  });
  return mapping;
};

export const incidentsReducer = (state: IncidentsStateType, action: IncidentsActions): IncidentsStateType => {
  const createUpdatedLM = (pk: Incident["pk"]): { [pk: number]: number } => {
    return { ...state.lastModified, [pk]: new Date().getTime() };
  };

  const findStoredIncidentIndex = (pk: Incident["pk"]): Index | null => {
    if (pk in state._storedIndexByPk) return state._storedIndexByPk[pk];
    return null;
  };

  const findIncidentIndex = (pk: Incident["pk"]): Index | null => {
    if (pk in state._indexByPk) return state._indexByPk[pk];
    return null;
  };

  switch (action.type) {
    // StoreAll is for saving incidents that ever appeared in view in between app refreshes,
    // i.e. incidents that could be present in several table pages (not necessarily only
    // in the one that is currently in user's view)
    case IncidentsType.StoreAll: {
      const newIncidents: Incident[] = action.payload;
      const _storedIndexByPk = createIncidentsIndex(newIncidents);
      const millis = new Date().getTime();
      const lastModifiedInStore: { [pk: number]: number } = {};
      newIncidents.forEach((incident: Incident) => {
        lastModifiedInStore[incident.pk] = millis;
      });
      const allIncidents = [...state.storedIncidents, ...newIncidents].reduce((i: Incident[],
                                                                               { pk,
                                                                                 start_time,
                                                                                 end_time,
                                                                                 stateful,
                                                                                 details_url,
                                                                                 description,
                                                                                 ticket_url,
                                                                                 open,
                                                                                 acked,
                                                                                 level,
                                                                                 source,
                                                                                 source_incident_id,
                                                                                 tags
                                                                               }: Incident) => {
        const incident = i.find(q => q.pk === pk);
        if (!incident) i.push({ pk, start_time, end_time, stateful, details_url, description, ticket_url, open, acked,
          level, source, source_incident_id, tags});
        return i;
      }, []);
      return { ...state, storedIncidents: allIncidents, lastModifiedInStore, _storedIndexByPk };
    }
    // LoadAll is merely for incidents that are currently in view, i.e. incidents that are
    // present in a current table page only
    case IncidentsType.LoadAll: {
      const incidents = action.payload;
      const _indexByPk = createIncidentsIndex(incidents);
      const millis = new Date().getTime();
      const lastModified: { [pk: number]: number } = {};
      incidents.forEach((incident: Incident) => {
        lastModified[incident.pk] = millis;
      });
      return { ...state, incidents, lastModified, _indexByPk };
    }

    case IncidentsType.ModifyIncident: {
      const incident: Incident = action.payload;
      const index: Index | null = findIncidentIndex(incident.pk);
      const storedIndex: Index | null = findStoredIncidentIndex(incident.pk);
      if (storedIndex === null) {
        // Doesn't exist :(
        return incidentsReducer(state, { type: IncidentsType.AddIncident, payload: incident });
      }

      const { storedIncidents } = state;
      const newStoredIncidents = storedIncidents.slice(0);
      newStoredIncidents[storedIndex] = incident;
      if (index === null) {
        return { ...state, storedIncidents: newStoredIncidents, lastModifiedInStore: createUpdatedLM(incident.pk) };
      } else {
        const { incidents } = state;
        const newIncidents = incidents.slice(0);
        newIncidents[index] = incident;
        return { ...state, incidents: newIncidents, storedIncidents: newStoredIncidents,
          lastModified: createUpdatedLM(incident.pk), lastModifiedInStore: createUpdatedLM(incident.pk) };
      }
    }

    case IncidentsType.RemoveIncident: {
      const pk: Incident["pk"] = action.payload;
      const index: Index | null = findIncidentIndex(pk);
      const storedIndex: Index | null = findStoredIncidentIndex(pk);
      if (storedIndex === null) {
        // Doesn't exist :(
        console.warn(`Trying to remove incident ${pk} that doesn't exist, ignoring.`);
        return state;
      }

      const storedIncidents = [...state.storedIncidents];
      storedIncidents.splice(storedIndex, 1);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pk]: removedIndex, ..._storedIndexByPk } = createIncidentsIndex(storedIncidents);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pk]: removedLM, ...lastModifiedInStore } = state.lastModifiedInStore;
      if (index === null) {
        return { ...state, storedIncidents: storedIncidents, lastModifiedInStore, _storedIndexByPk };
      } else {
        const incidents = [...state.incidents];
        incidents.splice(index, 1);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [pk]: removedIndex, ..._indexByPk } = createIncidentsIndex(incidents);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [pk]: removedLM, ...lastModified } = state.lastModified;
        return { ...state, incidents, storedIncidents: storedIncidents, lastModified, lastModifiedInStore,
          _indexByPk, _storedIndexByPk };
      }
    }

    case IncidentsType.AddIncident: {
      const incident: Incident = action.payload;
      const index: Index | null = findIncidentIndex(incident.pk);
      const storedIndex: Index | null = findStoredIncidentIndex(incident.pk);
      if (storedIndex !== null) {
        // Already exists :(
        console.warn(`Trying to add incident ${incident} that already exists, passing to modify instead.`);
        return incidentsReducer(state, { type: IncidentsType.ModifyIncident, payload: incident });
      }

      const storedIncidents = [...state.storedIncidents, incident];
      const lastModifiedInStore = createUpdatedLM(incident.pk);
      const _storedIndexByPk = { ...state._storedIndexByPk, [incident.pk]: state.storedIncidents.length };

      if (index === null) {
        return {
          ...state,
          storedIncidents,
          lastModifiedInStore,
          _storedIndexByPk,
        };
      } else {
        const incidents = [...state.incidents, incident];
        const lastModified = createUpdatedLM(incident.pk);
        const _indexByPk = { ...state._indexByPk, [incident.pk]: state.incidents.length };
        return {
          ...state,
          incidents,
          storedIncidents,
          lastModified,
          lastModifiedInStore,
          _indexByPk,
          _storedIndexByPk,
        };
      }
    }

    default:
      throw new Error(`Unexpected action type ${action}`);
  }
};

// Actions

type Dispatch = React.Dispatch<IncidentsActions>;

export const storeAllIncidents = (dispatch: Dispatch, incidents: Incident[]) =>
    dispatch({ type: IncidentsType.StoreAll, payload: incidents });

export const loadAllIncidents = (dispatch: Dispatch, incidents: Incident[]) =>
  dispatch({ type: IncidentsType.LoadAll, payload: incidents });

export const modifyIncident = (dispatch: Dispatch, incident: Incident) =>
  dispatch({ type: IncidentsType.ModifyIncident, payload: incident });

export const removeIncident = (dispatch: Dispatch, pk: Incident["pk"]) =>
  dispatch({ type: IncidentsType.RemoveIncident, payload: pk });

export const addIncident = (dispatch: Dispatch, incident: Incident) =>
  dispatch({ type: IncidentsType.AddIncident, payload: incident });

const findIncidentByPk = (state: IncidentsStateType, pk: Incident["pk"]): Incident | undefined => {
  if (pk in state._indexByPk) {
    const index = state._indexByPk[pk];
    const incident = state.incidents[index];
    if (incident.pk !== pk) {
      // index is invalid.
      throw new Error(
        `_indexByPk is invalid, index ${index} points to wrong index: expected ${pk} but got ${incident.pk}`,
      );
    }
    return incident;
  }
  return undefined;
};

const findStoredIncidentByPk = (state: IncidentsStateType, pk: Incident["pk"]): Incident | undefined => {
  if (pk in state._storedIndexByPk) {
    const index = state._storedIndexByPk[pk];
    const incident = state.storedIncidents[index];
    if (incident.pk !== pk) {
      // index is invalid.
      throw new Error(
          `_indexByPk is invalid, index ${index} points to wrong index: expected ${pk} but got ${incident.pk}`,
      );
    }
    return incident;
  }
  return undefined;
};

export const closeIncident = (state: IncidentsStateType, dispatch: Dispatch, pk: Incident["pk"]) => {
  const incident: Incident | undefined = findStoredIncidentByPk(state, pk);
  if (!incident) {
    throw new Error(`Unable to close incident with pk: ${pk}, couldn't find incident`);
  }
  modifyIncident(dispatch, { ...incident, open: false });
};

export const reopenIncident = (state: IncidentsStateType, dispatch: Dispatch, pk: Incident["pk"]) => {
  const incident: Incident | undefined = findStoredIncidentByPk(state, pk);
  if (!incident) {
    throw new Error(`Unable to reopen incident with pk: ${pk}, couldn't find incident`);
  }
  modifyIncident(dispatch, { ...incident, open: true });
};

export const addTicket = (state: IncidentsStateType, dispatch: Dispatch, pk: Incident["pk"], ticketUrl: string) => {
  const incident: Incident | undefined = findStoredIncidentByPk(state, pk);
  if (!incident) {
    throw new Error(`Unable to add ticket to incident with pk: ${pk}, couldn't find incident`);
  }
  modifyIncident(dispatch, { ...incident, ticket_url: ticketUrl });
};

// Context
export const IncidentsContext = createContext<{
  state: IncidentsStateType;
  dispatch: React.Dispatch<IncidentsActions>;
}>({
  state: initialIncidentsState,
  dispatch: () => null,
});

export const IncidentsProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(incidentsReducer, initialIncidentsState);

  return <IncidentsContext.Provider value={{ state, dispatch }}>{children}</IncidentsContext.Provider>;
};

export type IncidentsActionsType = {
  storeAllIncidents: (incidents: Incident[]) => void;
  loadAllIncidents: (incidents: Incident[]) => void;
  modifyIncident: (incident: Incident) => void;
  removeIncident: (pk: Incident["pk"]) => void;
  addIncident: (incident: Incident) => void;

  // Helpers
  incidentByPk: (pk: Incident["pk"]) => Incident | undefined;
  storedIncidentByPk: (pk: Incident["pk"]) => Incident | undefined;
  closeIncident: (pk: Incident["pk"]) => void;
  reopenIncident: (pk: Incident["pk"]) => void;
  acknowledgeIncident: (pk: Incident["pk"]) => void;
  addTicketUrl: (pk: Incident["pk"], ticketUrl: string) => void;

  dispatch: Dispatch;
};

export const useIncidentsContext = (): [IncidentsStateType, IncidentsActionsType] => {
  const { state, dispatch } = useContext(IncidentsContext);

  const storeAllIncidentsCallback = useCallback((incidents: Incident[]) => storeAllIncidents(dispatch, incidents), [
    dispatch,
  ]);

  const loadAllIncidentsCallback = useCallback((incidents: Incident[]) => loadAllIncidents(dispatch, incidents), [
    dispatch,
  ]);
  const modifyIncidentCallback = useCallback((incident: Incident) => modifyIncident(dispatch, incident), [dispatch]);
  const removeIncidentCallback = useCallback((pk: Incident["pk"]) => removeIncident(dispatch, pk), [dispatch]);

  const addIncidentCallback = useCallback((incident: Incident) => addIncident(dispatch, incident), [dispatch]);

  const incidentByPkCallback = useCallback((pk: Incident["pk"]): Incident | undefined => findIncidentByPk(state, pk), [
    state,
  ]);

  const storedIncidentByPkCallback = useCallback((pk: Incident["pk"]): Incident | undefined => findStoredIncidentByPk(state, pk), [
    state,
  ]);

  const closeIncidentCallback = useCallback((pk: Incident["pk"]) => closeIncident(state, dispatch, pk), [
    state,
    dispatch,
  ]);

  const reopenIncidentCallback = useCallback((pk: Incident["pk"]) => reopenIncident(state, dispatch, pk), [
    state,
    dispatch,
  ]);

  const addTicketCallback = useCallback((pk: Incident["pk"], ticketUrl: string) => addTicket(state, dispatch, pk, ticketUrl), [
    state,
    dispatch,
  ]);

  const acknowledgeIncidentCallback = useCallback(
    (pk: Incident["pk"]) => {
      const incident = findStoredIncidentByPk(state, pk);
      if (incident === undefined) {
        throw new Error(`Unable to acknowledge incident with pk: ${pk}, couldn't find it`);
      }
      modifyIncident(dispatch, { ...incident, acked: true });
    },
    [state, dispatch],
  );

  return [
    state,
    {
      storeAllIncidents: storeAllIncidentsCallback,
      loadAllIncidents: loadAllIncidentsCallback,
      modifyIncident: modifyIncidentCallback,
      removeIncident: removeIncidentCallback,
      addIncident: addIncidentCallback,

      // Helpers
      incidentByPk: incidentByPkCallback,
      storedIncidentByPk: storedIncidentByPkCallback,
      closeIncident: closeIncidentCallback,
      reopenIncident: reopenIncidentCallback,
      acknowledgeIncident: acknowledgeIncidentCallback,
      addTicketUrl: addTicketCallback,

      dispatch,
    },
  ];
};

export default IncidentsProvider;
