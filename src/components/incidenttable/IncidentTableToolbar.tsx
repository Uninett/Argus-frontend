import "./IncidentTableToolbar.css";

import React, { useEffect, useMemo } from "react";

import classNames from "classnames";

// MUI
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import LinkSharpIcon from "@material-ui/icons/LinkSharp";
import Typography from "@material-ui/core/Typography";

// Api
import type { Incident, AcknowledgementBody } from "../../api/types.d";

// Contexts/Hooks
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useSelectedFilter } from "../../components/filterprovider";
import { useIncidents } from "../../api/actions";
import { useAlerts } from "../alertsnackbar";

// Components
import { useStyles } from "../incident/styles";
import CreateAck from "../incident/CreateAckSignOffAction";
import ManualClose from "../incident/ManualCloseSignOffAction";
import OutlinedButton from "../buttons/OutlinedButton";
import AddTicketUrl from "../incident/AddTicketUrlSignOffAction";

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    selected: {
      backgroundColor: theme.palette.primary.light,
    },
    title: {
      flex: "1 1 100%",
    },
  }),
);

interface TableToolbarPropsType {
  selectedIncidents: Set<Incident["pk"]>;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const TableToolbar: React.FC<TableToolbarPropsType> = ({
  selectedIncidents,
  onClearSelection,
  isLoading,
}: TableToolbarPropsType) => {
  const classes = useToolbarStyles();
  const rootClasses = useStyles();
  const displayAlert = useAlerts();

  const [, { closeIncident, reopenIncident, acknowledgeIncident, addTicketUrl,
    bulkAcknowledgeIncidents, bulkAddTicketUrl }] = useIncidents();
  const [, { incidentByPk }] = useIncidentsContext();

  // XXX: In the future there should be better seperation of components, and this
  // shouldn't be needed here. Now it's used to clear selection when the filter changes.
  const [{ incidentsFilter: selectedFilter }] = useSelectedFilter();

  const allState: "mixed" | "open" | "closed" = useMemo(() => {
    const pks: Incident["pk"][] = [...selectedIncidents.keys()];
    if (pks.length === 0) return "mixed"; // no all state

    const incidentsMap = pks.map(incidentByPk);
    const firstState = incidentsMap[0]?.open ? "open" : "closed";

    const allSame = incidentsMap.every((incident?: Incident) => {
      if (incident === undefined) {
        // Failed to find some incident, just quit now
        return false;
      }
      const currentState = incident.open ? "open" : "closed";
      return firstState === currentState;
    });
    if (allSame) {
      return firstState;
    }
    return "mixed";
  }, [selectedIncidents, incidentByPk]);

  useEffect(() => {
    onClearSelection();
  }, [selectedFilter, onClearSelection]);

  return (
    <Toolbar
      variant="dense"
      className={`${selectedIncidents.size === 0 
        ? classes.root : `${classNames(classes.root, classes.selected)} incident-table-toolbar-selected`}
        `}
    >
      {selectedIncidents.size > 0 ? (
        <div className="table-toolbar-tooltip">
          <Tooltip title="Clear selection">
            <IconButton onClick={() => onClearSelection()}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            {selectedIncidents.size} selected
          </Typography>
        </div>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {(isLoading && "Loading incidents...") || "Incidents"}
        </Typography>
      )}

      {selectedIncidents.size > 0 ? (
        <div className="bulk-op-buttons">
          {
            /* NOT IMPLEMENTED */
            false && (
              <Tooltip title="Link">
                <IconButton aria-label="link" className={rootClasses.safeButton}>
                  <LinkSharpIcon />
                </IconButton>
              </Tooltip>
            )
          }
          <AddTicketUrl
            onAddTicketUrl={(url: string) => {
              const pks: Incident["pk"][] = [...selectedIncidents.values()];
              if (pks.length > 1) {
                bulkAddTicketUrl(pks, url)
                    .then((res) => {
                      onClearSelection();
                      displayAlert(`Updated ${res.length}/${pks.length} ticket URL(s)`, "success");
                    })
                    .catch((error) => {
                      displayAlert(`Failed to update ticket URL(s) - ${error}`, "error");
                    });
              } else {
                pks.forEach((pk: Incident["pk"]) => {
                  addTicketUrl(pk, url)
                      .then(() => {
                        onClearSelection();
                        displayAlert(`Updated ticket URL`, "success");
                      })
                      .catch((error) => displayAlert(`Failed to update ticket URL - ${error}`, "error"));
                });
              }
            }}
            signOffActionProps={{
              ButtonComponent: OutlinedButton,
              buttonProps: { className: "sign-off-button" },
            }}
          />

          <CreateAck
            onSubmitAck={(ackBody: AcknowledgementBody) => {
              console.log("acknowledegment of all incidents", selectedIncidents);
              const pks: Incident["pk"][] = [...selectedIncidents.values()];
              if (pks.length > 1) {
                bulkAcknowledgeIncidents(pks, ackBody)
                    .then((acks) => {
                      onClearSelection();
                      displayAlert(`Submitted ${acks.length}/${pks.length} acknowledgment(s)`, "success");
                    }).catch((error) => {
                      displayAlert(`Failed to submit acknowledgments(s) - ${error}`, "error");
                });
              } else {
                pks.forEach((pk: Incident["pk"]) => {
                  acknowledgeIncident(pk, ackBody)
                      .then(() => {
                        onClearSelection();
                        displayAlert(`Submitted acknowledgment`, "success");
                      })
                      .catch((error) => {
                        displayAlert(`Failed to submit acknowledgment - ${error}`, "error")
                      });
                });
              }
            }}
            signOffActionProps={{
              dialogButtonText: "Ack",
              ButtonComponent: OutlinedButton,
              buttonProps: { className: "sign-off-button" },
            }}
          />

          {allState !== "mixed" && (
            <ManualClose
              open={allState === "open"}
              onManualClose={(msg: string) => {
                console.log("closing of all incidents", selectedIncidents);
                const pks: Incident["pk"][] = [...selectedIncidents.values()];
                pks.forEach((pk: Incident["pk"]) => {
                  closeIncident(pk, msg)
                    .then(() => {
                      onClearSelection();
                      displayAlert(`Closed incident(s)`, "success");
                    })
                    .catch((error) => displayAlert(`Failed to close incident(s) - ${error}`, "error"));
                });
              }}
              onManualOpen={() => {
                console.log("reopening of all incidents", selectedIncidents);
                const pks: Incident["pk"][] = [...selectedIncidents.values()];
                pks.forEach((pk: Incident["pk"]) => {
                  reopenIncident(pk)
                    .then(() => {
                      onClearSelection();
                      displayAlert(`Reopened incident(s)`, "success");
                    })
                    .catch((error) => {
                      console.log(error);
                      displayAlert(`Failed to reopen incident(s) - ${error}`, "error")
                    });
                });
              }}
              reopenButtonText="Re-open selected"
              closeButtonText="Close selected"
              signOffActionProps={{
                ButtonComponent: OutlinedButton,
                buttonProps: { className: "sign-off-button"},
              }}
              reopenButtonProps={{ className: "sign-off-button", variant: "outlined"}}
              ButtonComponent={OutlinedButton}
            />
          )}
        </div>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

export default TableToolbar;
