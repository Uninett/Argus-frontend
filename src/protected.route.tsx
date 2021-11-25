import React, {useContext} from "react";
import { Route, Redirect } from "react-router-dom";

// Api
import type { User } from "./api/types.d";
import api from "./api";
import auth from "./auth";

// Contexts/Hooks
import { AppContext } from "./state/contexts";
import {loginUser, logoutUser} from "./state/reducers/user";
import {Cookies} from "react-cookie";

type ProtectedRoutePropsType = {
  // Should be able to take all components, so any is probably acceptable here?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  [key: string]: unknown;
};

export const ProtectedRoute: React.SFC<ProtectedRoutePropsType> = ({
  component: Component,
  ...rest
}: ProtectedRoutePropsType) => {
  const cookies = new Cookies();
  const { dispatch } = useContext(AppContext);

  const logUserOut = async () => {
    dispatch(logoutUser())
    auth.logout();
  }

  const updateLoginStatus = () => {
    const token = cookies.get("token")

    if (token && token !== undefined && !auth.isAuthenticated()){
      auth.login(token, async () => {
        await api
          .authGetCurrentUser()
          .then((resUser: User) => {
            dispatch(loginUser(resUser))
          })
          .catch(async () => {
            await logUserOut();
          });
      });
    }
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        updateLoginStatus()
        if (auth.token()) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      }}
    />
  );
};
