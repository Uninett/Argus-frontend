import React, { useMemo } from "react";

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
import { Incident, AcknowledgementBody } from "../../api";

// Contexts/Hooks
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useIncidents } from "../../api/actions";

// Components
import { useStyles } from "../incident/styles";
import CreateAck from "../incident/CreateAckSignOffAction";
import ManualClose from "../incident/ManualCloseSignOffAction";
import OutlinedButton from "../buttons/OutlinedButton";

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
  isLoading?: boolean;
  onClearSelection?: () => void;
}

export const TableToolbar: React.FC<TableToolbarPropsType> = ({
  selectedIncidents,
  isLoading,
  onClearSelection = () => undefined,
}: TableToolbarPropsType) => {
  const classes = useToolbarStyles();
  const rootClasses = useStyles();

  const [, { closeIncident, reopenIncident, acknowledgeIncident }] = useIncidents();
  const [incidents, { incidentByPk }] = useIncidentsContext();

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
  }, [selectedIncidents, incidents, incidentByPk]);

  return (
    <Toolbar
      variant="dense"
      className={selectedIncidents.size === 0 ? classes.root : classNames(classes.root, classes.selected)}
    >
      {selectedIncidents.size > 0 ? (
        <>
          <Tooltip title="Clear selection">
            <IconButton onClick={() => onClearSelection()}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            {selectedIncidents.size} selected
          </Typography>
        </>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {(isLoading && "Loading incidents...") || "Incidents"}
        </Typography>
      )}

      {selectedIncidents.size > 0 ? (
        <>
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
          <CreateAck
            onSubmitAck={(ackBody: AcknowledgementBody) => {
              console.log("acknowledegment of all incidents", selectedIncidents);
              const pks: Incident["pk"][] = [...selectedIncidents.values()];
              pks.forEach((pk: Incident["pk"]) => {
                acknowledgeIncident(pk, ackBody);
              });
            }}
            signOffActionProps={{
              dialogButtonText: "Ack",
              ButtonComponent: OutlinedButton,
              buttonProps: { className: undefined },
            }}
          />

          {allState !== "mixed" && (
            <ManualClose
              open={allState === "open"}
              onManualClose={(msg: string) => {
                console.log("closing of all incidents", selectedIncidents);
                const pks: Incident["pk"][] = [...selectedIncidents.values()];
                pks.forEach((pk: Incident["pk"]) => {
                  closeIncident(pk, msg);
                });
              }}
              onManualOpen={() => {
                console.log("reopening of all incidents", selectedIncidents);
                const pks: Incident["pk"][] = [...selectedIncidents.values()];
                pks.forEach((pk: Incident["pk"]) => {
                  reopenIncident(pk);
                });
              }}
              reopenButtonText="Re-open selected"
              closeButtonText="Close selected"
              signOffActionProps={{
                ButtonComponent: OutlinedButton,
                buttonProps: { className: undefined, size: "small" },
              }}
              reopenButtonProps={{ className: undefined, variant: "outlined", size: "small" }}
              ButtonComponent={OutlinedButton}
            />
          )}
        </>
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
