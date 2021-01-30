import React, { useReducer, useContext, createContext } from "react";

import { Incident } from "../api";

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
export const incidentsReducer = (state: IncidentsStateType, action: IncidentsActions): IncidentsStateType => {
  const createIncidentsIndex = (incidents: Incident[]): { [pk: number]: Index } => {
    const mapping: { [pk: number]: Index } = {};
    incidents.forEach((incident: Incident, index: number) => {
      mapping[incident.pk] = index;
    });
    return mapping;
  };

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

type IncidentsDispatch = React.Dispatch<IncidentsActions>;

export const useIncidentsContext = (): [
  IncidentsStateType,
  {
    loadAllIncidents: (incidents: Incident[]) => void;
    modifyIncident: (incident: Incident) => void;
    removeIncident: (pk: Incident["pk"]) => void;
    addIncident: (incident: Incident) => void;
    incidentByPk: (pk: Incident["pk"]) => Incident | undefined;
    dispatch: IncidentsDispatch;
  },
] => {
  const { state, dispatch } = useContext(IncidentsContext);
  return [
    state,
    {
      loadAllIncidents: (incidents: Incident[]) => dispatch({ type: IncidentsType.LoadAll, payload: incidents }),
      modifyIncident: (incident: Incident) => dispatch({ type: IncidentsType.ModifyIncident, payload: incident }),
      removeIncident: (pk: Incident["pk"]) => dispatch({ type: IncidentsType.RemoveIncident, payload: pk }),
      addIncident: (incident: Incident) => dispatch({ type: IncidentsType.AddIncident, payload: incident }),
      incidentByPk: (pk: Incident["pk"]): Incident | undefined => {
        if (pk in state._indexByPk) {
          const index = state._indexByPk[pk];
          return state.incidents[index];
        }
        return undefined;
      },
      dispatch,
    },
  ];
};

export default IncidentsProvider;
