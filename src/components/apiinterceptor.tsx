import React, { useEffect, useContext } from "react";

import { useHistory } from "react-router-dom";

// Api
import { ApiEvent } from "../api/types.d";
import api from "../api";
import auth from "../auth";

// Contexts/Hooks
import { AppContext } from "../state/contexts";
import { useAlerts } from "../components/alertsnackbar";

import { setHasConnectionProblems, unsetHasConnectionProblems } from "../state/reducers/apistate";
import {logoutUser} from "../state/reducers/user";
import {getErrorCause} from "../api/utils";

export const ApiInterceptor = ({ children }: { children?: React.ReactNode }) => {
  const history = useHistory();
  const displayAlert = useAlerts();

  const { dispatch } = useContext(AppContext);

  useEffect(() => {
    api.registerInterceptors(
      () => {
        displayAlert("Unauthorized, logging out", "error");
        dispatch(logoutUser())
        auth.logout();
        history.push("/login");
      },
      (response, error) => {
        displayAlert(`Api Server Error: ${error}`, "error");
      },
        (response, error) => {
          displayAlert(`Plugin Error: ${getErrorCause(error)}`, "error");
        },
    );

    const listenerId = api.subscribe((event: ApiEvent) => {
      switch (event.type) {
        case "error": {
          const { response, error } = event;
          if (!response.response || !response.response.status) {
            dispatch(setHasConnectionProblems());
          }
          console.error("catched network error", response, error);
          break;
        }
        case "success": {
          dispatch(unsetHasConnectionProblems());
          break;
        }
      }
    });

    return () => {
      api.unsubscribe(listenerId);
      api.unregisterInterceptors();
    };
  }, [displayAlert, dispatch, history]);

  return <>{children}</>;
};

export default ApiInterceptor;
