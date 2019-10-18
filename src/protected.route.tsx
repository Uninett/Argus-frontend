import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import auth from './auth';

export const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (
          auth.isAuthenticated() ||
          localStorage.getItem('loggedin') === 'true'
        ) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: {
                  from: props.location
                }
              }}
            />
          );
        }
      }}
    />
  );
};
