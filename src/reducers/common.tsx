export type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type Action<T, P> = (payload: P) => { type: T; payload: P };
export function makeAction<T, P>(type: T): Action<T, P> {
  return (payload: P): { type: T; payload: P } => {
    return { type, payload };
  };
}

export type ActionWithoutPayload<T> = () => { type: T; payload: undefined };
export function makeActionWithoutPayload<T>(type: T): ActionWithoutPayload<T> {
  return (): { type: T; payload: undefined } => {
    return { type, payload: undefined };
  };
}
