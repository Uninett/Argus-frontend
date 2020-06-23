import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "./auth";
import handleFeide from "./handleFeide";

export const ProtectedRoute = ({ component: Component, ...rest }: any) => {
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
