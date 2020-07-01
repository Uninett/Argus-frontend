/* eslint-disable */
import React from "react";

interface State {
  user: string | null;
  token: string | null;
  loggedIn: boolean;
}

const initialState: State = {
  user: localStorage.getItem("user"),
  token: localStorage.getItem("token"),
  loggedIn: localStorage.getItem("user") ? true : false,
};

export const Store = React.createContext<State | any>(initialState);

function reducer(state: State, action: { type: string; payload: any }): State {
  switch (action.type) {
    case "setUser":
      return { ...state, user: action.payload };
    case "setToken":
      return { ...state, token: action.payload };
    case "setLogin":
      return { ...state, token: action.payload };
    default:
      return initialState;
  }
}

export function StoreProvider(props: any) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const values = { state, dispatch };
  return <Store.Provider value={values}>{props.children}</Store.Provider>;
}
