import React, { useReducer, useCallback, useContext, createContext } from "react";

// Api
import type { Incident } from "../api/types.d";

// Store
import { ActionMap } from "../reducers/common";

type Index = number;

export type IncidentsStateType = {
  incidents: Incident[];

  // lastModified: number in millis since epoch, of last modification
  lastModified: { [pk: number]: number };

  // _indexByPk indexes the incident pk to index in incidents
  _indexByPk: { [pk: number]: Index };
};

const initialIncidentsState: IncidentsStateType = {
  incidents: [],
  lastModified: {},
  _indexByPk: {},
};

export enum IncidentsType {
  LoadAll = "LOAD_ALL_INCIDENTS",
  ModifyIncident = "MODIFY_INCIDENT",
  RemoveIncident = "REMOVE_INCIDENT",
  AddIncident = "ADD_INCIDENT",
}

export type IncidentsPayload = {
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

  const findIncidentIndex = (pk: Incident["pk"]): Index | null => {
    if (pk in state._indexByPk) return state._indexByPk[pk];
    return null;
  };

  switch (action.type) {
    case IncidentsType.LoadAll: {
      const incidents = action.payload;
      const _indexByPk = createIncidentsIndex(incidents);
      const millis = new Date().getTime();
      const lastModified: { [pk: number]: number } = {};
      incidents.forEach((incident: Incident) => {
        lastModified[incident.pk] = millis;
      });
      return { incidents, lastModified, _indexByPk };
    }

    case IncidentsType.ModifyIncident: {
      const incident: Incident = action.payload;
      const index: Index | null = findIncidentIndex(incident.pk);
      if (index === null) {
        // Doesn't exist :(
        // throw new Error(`Incident ${incident.pk} can't be modified because it doesn't exist`);
        return incidentsReducer(state, { type: IncidentsType.AddIncident, payload: incident });
      }

      const { incidents } = state;
      const newIncidents = incidents.slice(0);
      newIncidents[index] = incident;
      return { ...state, incidents: newIncidents, lastModified: createUpdatedLM(incident.pk) };
    }

    case IncidentsType.RemoveIncident: {
      const pk: Incident["pk"] = action.payload;
      const index: Index | null = findIncidentIndex(pk);
      if (index === null) {
        // Doesn't exist :(
        console.warn(`Trying to remove incident ${pk} that doesn't exist, ignoring.`);
        // throw new Error(`Incident ${pk} can't be removed because it doesn't exist`);
        return state;
      }

      const incidents = [...state.incidents];
      incidents.splice(index, 1);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pk]: removedIndex, ..._indexByPk } = createIncidentsIndex(incidents);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pk]: removedLM, ...lastModified } = state.lastModified;
      // const _indexByPk = createIncidentsIndex(incidents);
      return { incidents: incidents, lastModified, _indexByPk };
    }

    case IncidentsType.AddIncident: {
      const incident: Incident = action.payload;
      const index: Index | null = findIncidentIndex(incident.pk);
      if (index !== null) {
        // Already exists :(
        // throw new Error(`Incident ${incident} can't be added because it already exists`);
        console.warn(`Trying to add incident ${incident} that already exists, passing to modify instead.`);
        return incidentsReducer(state, { type: IncidentsType.ModifyIncident, payload: incident });
      }

      const incidents = [...state.incidents, incident];
      const lastModified = createUpdatedLM(incident.pk);
      const _indexByPk = { ...state._indexByPk, [incident.pk]: state.incidents.length };

      return {
        incidents,
        lastModified,
        _indexByPk,
      };
    }

    default:
      throw new Error(`Unexpected action type ${action}`);
  }
};

// Actions

type Dispatch = React.Dispatch<IncidentsActions>;

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

export const closeIncident = (state: IncidentsStateType, dispatch: Dispatch, pk: Incident["pk"]) => {
  const incident: Incident | undefined = findIncidentByPk(state, pk);
  if (!incident) {
    throw new Error(`Unable to close incident with pk: ${pk}, couldn't find incident`);
  }
  modifyIncident(dispatch, { ...incident, open: false });
};

export const reopenIncident = (state: IncidentsStateType, dispatch: Dispatch, pk: Incident["pk"]) => {
  const incident: Incident | undefined = findIncidentByPk(state, pk);
  if (!incident) {
    throw new Error(`Unable to reopen incident with pk: ${pk}, couldn't find incident`);
  }
  modifyIncident(dispatch, { ...incident, open: true });
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
  loadAllIncidents: (incidents: Incident[]) => void;
  modifyIncident: (incident: Incident) => void;
  removeIncident: (pk: Incident["pk"]) => void;
  addIncident: (incident: Incident) => void;

  // Helpers
  incidentByPk: (pk: Incident["pk"]) => Incident | undefined;
  closeIncident: (pk: Incident["pk"]) => void;
  reopenIncident: (pk: Incident["pk"]) => void;
  acknowledgeIncident: (pk: Incident["pk"]) => void;

  dispatch: Dispatch;
};

export const useIncidentsContext = (): [IncidentsStateType, IncidentsActionsType] => {
  const { state, dispatch } = useContext(IncidentsContext);

  const loadAllIncidentsCallback = useCallback((incidents: Incident[]) => loadAllIncidents(dispatch, incidents), [
    dispatch,
  ]);
  const modifyIncidentCallback = useCallback((incident: Incident) => modifyIncident(dispatch, incident), [dispatch]);
  const removeIncidentCallback = useCallback((pk: Incident["pk"]) => removeIncident(dispatch, pk), [dispatch]);

  const addIncidentCallback = useCallback((incident: Incident) => addIncident(dispatch, incident), [dispatch]);

  const incidentByPkCallback = useCallback((pk: Incident["pk"]): Incident | undefined => findIncidentByPk(state, pk), [
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

  const acknowledgeIncidentCallback = useCallback(
    (pk: Incident["pk"]) => {
      const incident = findIncidentByPk(state, pk);
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
      loadAllIncidents: loadAllIncidentsCallback,
      modifyIncident: modifyIncidentCallback,
      removeIncident: removeIncidentCallback,
      addIncident: addIncidentCallback,

      // Helpers
      incidentByPk: incidentByPkCallback,
      closeIncident: closeIncidentCallback,
      reopenIncident: reopenIncidentCallback,
      acknowledgeIncident: acknowledgeIncidentCallback,

      dispatch,
    },
  ];
};

export default IncidentsProvider;
