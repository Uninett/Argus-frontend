import React, { useEffect, useState, useMemo } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Dialog from "@material-ui/core/Dialog";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import CheckSharpIcon from "@material-ui/icons/CheckSharp";
import LinkSharpIcon from "@material-ui/icons/LinkSharp";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";

import Typography from "@material-ui/core/Typography";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell, { TableCellProps } from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";

import { useStateWithDynamicDefault, toMap, pkGetter, truncateMultilineString, formatTimestamp } from "../../utils";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

import { Incident } from "../../api";
import { BACKEND_WS_URL } from "../../config";
import { useStyles } from "../incident/styles";
import { AckedItem, OpenItem, TicketItem } from "../incident/Chips";
import IncidentDetails from "../incident/IncidentDetails";

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    title: {
      flex: "1 1 100%",
    },
  }),
);

interface TableToolbarPropsType {
  selectedIncidents: Set<Incident["pk"]> | "SelectedAll";
  isLoading?: boolean;
}

/* TODO: Not implemented completely */
const TableToolbar: React.FC<TableToolbarPropsType> = ({ selectedIncidents, isLoading }: TableToolbarPropsType) => {
  const classes = useToolbarStyles();
  const rootClasses = useStyles();

  return (
    <Toolbar className={classes.root}>
      {selectedIncidents === "SelectedAll" || selectedIncidents.size > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {selectedIncidents === "SelectedAll" ? "All" : selectedIncidents.size} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {(isLoading && "Loading incidents...") || "Incidents"}
        </Typography>
      )}

      {selectedIncidents === "SelectedAll" || selectedIncidents.size > 0 ? (
        <>
          <Tooltip title="Link">
            <IconButton aria-label="link" className={rootClasses.safeButton}>
              <LinkSharpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Acknowledge" className={rootClasses.dangerousButton}>
            <IconButton aria-label="acknowledge">
              <CheckSharpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" className={rootClasses.dangerousButton}>
            <IconButton aria-label="close">
              <CloseIcon />
            </IconButton>
          </Tooltip>
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

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// TODO: refactor
type Order = "asc" | "desc";

function getComparator<T extends { [key: string]: number | string }>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

type MUIIncidentTablePropsType = {
  incidents: Incident[];
  onShowDetail: (incide: Incident) => void;
  isLoading?: boolean;
};

const MUIIncidentTable: React.FC<MUIIncidentTablePropsType> = ({
  incidents,
  onShowDetail,
  isLoading,
}: MUIIncidentTablePropsType) => {
  const classes = useStyles();
  type SelectionState = "SelectedAll" | Set<Incident["pk"]>;
  const [selectedIncidents, setSelectedIncidents] = useState<SelectionState>(new Set<Incident["pk"]>([]));

  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [page, setPage] = useState<number>(0);

  type IncidentOrderableFields = Pick<Incident, "start_time">;

  // TODO: implement proper ordering/sorting when support
  // for this is implemented in the backend.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [order, setOrder] = React.useState<Order>("desc");
  // TODO: fix typing problems here without use of any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderBy, setOrderBy] = React.useState<keyof IncidentOrderableFields>("start_time");

  const resetSelectedIncidents = () => {
    setSelectedIncidents(new Set<Incident["pk"]>());
  };

  const handleChangePage = (event: unknown, page: number) => {
    setPage(page);
    resetSelectedIncidents();
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
    resetSelectedIncidents();
  };

  const handleRowClick = (event: React.MouseEvent<unknown>, incident: Incident) => {
    onShowDetail(incident);
  };

  const handleToggleSelectAll = () => {
    setSelectedIncidents((oldSelectedIncidents: SelectionState) => {
      if (oldSelectedIncidents === "SelectedAll") {
        return new Set<Incident["pk"]>([]);
      }
      return "SelectedAll";
    });
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidents((oldSelectedIncidents: SelectionState) => {
      if (oldSelectedIncidents === "SelectedAll") {
        const newSelected = new Set<Incident["pk"]>([...incidents.map((incident: Incident) => incident.pk)]);
        newSelected.delete(incident.pk);
        return newSelected;
      }
      const newSelectedIncidents = new Set<Incident["pk"]>(oldSelectedIncidents);
      if (oldSelectedIncidents.has(incident.pk)) {
        newSelectedIncidents.delete(incident.pk);
      } else {
        newSelectedIncidents.add(incident.pk);
      }
      return newSelectedIncidents;
    });
  };

  return (
    <Paper>
      {/* TODO: Not implemented yet */}
      {false && <TableToolbar isLoading={isLoading} selectedIncidents={selectedIncidents} />}
      <TableContainer component={Paper}>
        <MuiTable size="small" aria-label="incident table">
          <TableHead>
            <TableRow>
              {/* TODO: Not implemented yet */}
              {false && (
                <TableCell padding="checkbox" onClick={() => handleToggleSelectAll()}>
                  <Checkbox disabled={isLoading} checked={selectedIncidents === "SelectedAll"} />
                </TableCell>
              )}
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort<Incident>(incidents, getComparator<IncidentOrderableFields>(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((incident: Incident) => {
                const ClickableCell = (props: TableCellProps) => (
                  <TableCell onClick={(event) => handleRowClick(event, incident)} {...props} />
                );

                const isSelected = selectedIncidents === "SelectedAll" || selectedIncidents.has(incident.pk);

                return (
                  <TableRow
                    hover
                    key={incident.pk}
                    selected={isSelected}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {/* TODO: Not implemented yet */}
                    {false && (
                      <TableCell padding="checkbox" onClick={() => handleSelectIncident(incident)}>
                        <Checkbox disabled={isLoading} checked={isSelected} />
                      </TableCell>
                    )}
                    <ClickableCell>{formatTimestamp(incident.start_time)}</ClickableCell>
                    <ClickableCell component="th" scope="row">
                      <OpenItem small open={incident.open} />
                      <TicketItem small ticketUrl={incident.ticket_url} />
                      <AckedItem small acked={incident.acked} />
                    </ClickableCell>
                    <ClickableCell>{incident.source.name}</ClickableCell>
                    <ClickableCell>{incident.description}</ClickableCell>
                    <TableCell>
                      <Button
                        disabled={isLoading}
                        className={classes.safeButton}
                        onClick={() => onShowDetail(incident)}
                      >
                        Details
                      </Button>
                      {/* TODO: Not implementd yet */}
                      {false && (
                        <Button disabled={isLoading} className={classes.safeButton} href="https://localhost.com">
                          Ticket
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={incidents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

type Revisioned<T> = T & { revision?: number };

type IncidentsProps = {
  incidents: Incident[];
  noDataText: string;
  realtime?: boolean;
  open?: boolean;
  isLoading?: boolean;
};

const IncidentTable: React.FC<IncidentsProps> = ({ incidents, realtime, open, isLoading }: IncidentsProps) => {
  const [incidentForDetail, setIncidentForDetail] = useState<Incident | undefined>(undefined);

  const incidentsDictFromProps = useMemo<Revisioned<Map<Incident["pk"], Incident>>>(
    () => toMap<Incident["pk"], Incident>(incidents, pkGetter),
    [incidents],
  );

  const [incidentsDict, setIncidentsDict] = useStateWithDynamicDefault<Revisioned<Map<Incident["pk"], Incident>>>(
    incidentsDictFromProps,
  );

  const [incidentsUpdated, setIncidentsUpdated] = useState<Revisioned<Incident[]>>(incidents);
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  useEffect(() => {
    console.log("updating incidents");
    setIncidentsUpdated([...incidentsDict.values()]);
  }, [incidentsDict]);

  const handleShowDetail = (incident: Incident) => {
    setIncidentForDetail(incident);
  };

  const classes = useStyles();

  const onModalClose = () => {
    setIncidentForDetail(undefined);
  };

  const handleIncidentChange = (incident: Incident) => {
    // TODO: handle acked/unacked changes as well because there is now
    // the showAcked variable in the "supercomponent" IncidentView that
    // passes the incidents to the incidentstable.
    // An alternative is to have a "filter" function that is passed to
    // this component from the composing component.
    setIncidentsDict((oldDict: Revisioned<Map<Incident["pk"], Incident>>) => {
      const newDict: typeof oldDict = new Map<Incident["pk"], Incident>(oldDict);
      const oldIncident = oldDict.get(incident.pk);
      if (!oldIncident || incident.open != oldIncident.open) {
        if (!incident.open) {
          // closed
          newDict.delete(incident.pk);
        } else {
          // opened (somehow)
          newDict.set(incident.pk, incident);
        }
      } else {
        // updated in some other way
        newDict.set(incident.pk, incident);
      }
      newDict.revision = (newDict.revision || 1) + 1;
      //onsole.log("revision", newDict.revision);
      return newDict;
    });
    if (incidentForDetail && incidentForDetail.pk === incident.pk) setIncidentForDetail(incident);
  };

  // TODO: move this logic somewhere else
  useEffect(() => {
    if (!realtime) return;

    const ws = new WebSocket(`${BACKEND_WS_URL}/active/`);
    // cookies.set("token", token, { path: "/", secure: USE_SECURE_COOKIE });
    console.log("websocket", ws);

    const msg = {
      action: "subscribe",
    };
    ws.onmessage = function (e) {
      const data = JSON.parse(e.data);
      console.log("onmessage", data);

      switch (data.type) {
        case "modified":
          const modifiedIncident: Incident = data.payload;
          handleIncidentChange(modifiedIncident);
          break;
        case "created":
          console.log("Created", data);
          const createdIncident: Incident = data.payload;

          if (open && !createdIncident.open) {
            // TODO: how to handle this?
            break;
          }

          setIncidentsDict((oldDict: Revisioned<Map<Incident["pk"], Incident>>) => {
            const newDict: typeof oldDict = new Map<Incident["pk"], Incident>(oldDict);
            newDict.revision = (newDict.revision || 1) + 1;
            newDict.set(createdIncident.pk, createdIncident);
            return newDict;
          });
          break;

        case "deleted":
          console.log("Deleted", data);
          const deletedIncident: Incident = data.payload;

          setIncidentsDict((oldDict: Revisioned<Map<Incident["pk"], Incident>>) => {
            const newDict: typeof oldDict = new Map<Incident["pk"], Incident>(oldDict);
            newDict.revision = (newDict.revision || 1) + 1;
            newDict.delete(deletedIncident.pk);
            return newDict;
          });
          break;

        case "subscribed":
          const incidents: Incident[] = data.start_incidents;
          setIncidentsDict((oldDict: Revisioned<Map<Incident["pk"], Incident>>) => {
            const newDict: typeof oldDict = new Map<Incident["pk"], Incident>(oldDict);
            newDict.revision = (newDict.revision || 1) + 1;
            incidents.map((incident: Incident) => newDict.set(incident.pk, incident));
            return newDict;
          });
          displayAlertSnackbar(`Subscribed for realtime updates`, "success");
          break;

        default:
          displayAlertSnackbar(`Unhandled WebSockets message type: ${data.type}`, "warning");
          break;
      }
    };

    ws.onopen = () => {
      console.log("onopen");
      ws.send(JSON.stringify(msg));
    };

    ws.onclose = () => {
      console.log("onclose");
      ws.close();
      displayAlertSnackbar(`Realtime updates disabled`, "success");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ClickAwayListener onClickAway={onModalClose}>
      <div>
        <Dialog
          open={!!incidentForDetail}
          onClose={() => setIncidentForDetail(undefined)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          maxWidth={"lg"}
        >
          {(incidentForDetail && (
            <div>
              <AppBar position="static">
                <Toolbar variant="dense">
                  <IconButton
                    edge="start"
                    onClick={onModalClose}
                    className={classes.closeIcon}
                    color="inherit"
                    aria-label="close"
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" className={classes.title}>
                    {truncateMultilineString(incidentForDetail.description, 50)}
                  </Typography>
                </Toolbar>
              </AppBar>
              <IncidentDetails
                key={incidentForDetail.pk}
                onIncidentChange={handleIncidentChange}
                incident={incidentForDetail}
                displayAlertSnackbar={displayAlertSnackbar}
              />
            </div>
          )) || <h1>Empty</h1>}
        </Dialog>
        {realtime && <Typography>Realtime</Typography>}
        <MUIIncidentTable isLoading={isLoading} incidents={incidentsUpdated} onShowDetail={handleShowDetail} />
        {incidentSnackbar}
      </div>
    </ClickAwayListener>
  );
};

export default IncidentTable;
