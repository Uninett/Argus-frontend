import React, {useContext, useEffect} from "react";
import { Route, Redirect } from "react-router-dom";

// Api
import type { User } from "./api/types.d";
import api from "./api";
import auth from "./auth";

// Contexts/Hooks
import { AppContext } from "./state/contexts";
import { loginUser } from "./state/reducers/user";
import {useUser} from "./state/hooks";

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
  const { dispatch } = useContext(AppContext);
  const [user] = useUser();

  useEffect(() => {
    const token = auth.token();

    if (!user.isAuthenticated && token !== undefined) {
      auth.login(token, () => {
        api
          .authGetCurrentUser()
          .then((user: User) => {
            dispatch(loginUser(user));
          })
          .catch((error) => {
            console.log("error", error);
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, auth.token()])

  return (
    <Route
      {...rest}
      render={(props) => {
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
