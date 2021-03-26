import type { User, Token } from "../api/types.d";
import { ActionMap, makeAction, makeActionWithoutPayload } from "./common";

// For making it easier for components that need a default display name
// even if the user isn't logged int, we add that to the state by default.
// This also makes it so that the change will propogate automatically.
export type UserStateType = {
  object: User | undefined;
  displayName: string;
  isAuthenticated: boolean;
  isTokenAuthenticated: boolean;
  token: string | undefined;
};

export enum UserType {
  Login = "LOGIN",
  LoginToken = "LOGIN_TOKEN",
  Logout = "LOGOUT",
}

type UserPayload = {
  [UserType.Login]: User;
  [UserType.LoginToken]: { user: User; token: Token };
  [UserType.Logout]: undefined;
};

export const initialUserState = {
  object: undefined,
  displayName: "Anonymous",
  isAuthenticated: false,
  isTokenAuthenticated: false,
  token: undefined,
};

export type UserActions = ActionMap<UserPayload>[keyof ActionMap<UserPayload>];
export const userReducer = (state: UserStateType, action: UserActions) => {
  switch (action.type) {
    case UserType.Login:
      return {
        object: action.payload,
        displayName: action.payload.first_name,
        isAuthenticated: true,
        isTokenAuthenticated: false,
        token: undefined,
      };
    case UserType.LoginToken:
      const { user, token } = action.payload;
      return {
        token,
        object: user,
        displayName: user.first_name,
        isAuthenticated: true,
        isTokenAuthenticated: true,
      };
    case UserType.Logout: {
      return initialUserState;
    }
    default:
      return state;
  }
};

export const loginUser = makeAction<UserType.Login, User>(UserType.Login);
export const loginTokenUser = makeAction<UserType.LoginToken, { user: User; token: Token }>(UserType.LoginToken);
export const logoutUser = makeActionWithoutPayload<UserType.Logout>(UserType.Logout);
