import { User } from "../api";
import { ActionMap, makeAction, makeActionWithoutPayload } from "./common";

// For making it easier for components that need a default display name
// even if the user isn't logged int, we add that to the state by default.
// This also makes it so that the change will propogate automatically.
export type UserStateType = { object: User | undefined; displayName: string };

export enum UserType {
  Login = "LOGIN",
  Logout = "LOGOUT",
}

type UserPayload = {
  [UserType.Login]: User;
  [UserType.Logout]: undefined;
};

export const initialUserState = {
  object: undefined,
  displayName: "Anonymous",
};

export type UserActions = ActionMap<UserPayload>[keyof ActionMap<UserPayload>];
export const userReducer = (state: UserStateType, action: UserActions) => {
  switch (action.type) {
    case UserType.Login:
      return {
        object: action.payload,
        displayName: action.payload.first_name,
      };
    case UserType.Logout: {
      return initialUserState;
    }
    default:
      return state;
  }
};

export const loginUser = makeAction<UserType.Login, User>(UserType.Login);
export const logoutUser = makeActionWithoutPayload<UserType.Logout>(UserType.Logout);
