import React from "react";

interface IState {
  user: string;
}

const initialState: IState = { user: "tjalve" };

export const Store = React.createContext<IState | any>(initialState);

function reducer(
  state: IState,
  action: { type: string; payload: any }
): IState {
  switch (action.type) {
    case "setUser":
      return { ...state, user: action.payload };
    default:
      return initialState;
  }
}

export function StoreProvider(props: any) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const values = { state, dispatch };
  return <Store.Provider value={values}>{props.children}</Store.Provider>;
}
