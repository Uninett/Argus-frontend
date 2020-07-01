import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "./auth";
import handleFeide from "./handleFeide";

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
  return (
    <Route
      {...rest}
      render={(props) => {
        handleFeide.loggedIn();
        if (auth.isAuthenticated()) {
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
