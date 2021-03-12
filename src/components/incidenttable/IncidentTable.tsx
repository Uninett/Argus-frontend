import React, { useEffect, useState, useMemo, useCallback } from "react";

import { Link } from "react-router-dom";

import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import MuiTable from "@material-ui/core/Table";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TableCell, { TableCellProps } from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TicketIcon from "@material-ui/icons/LocalOffer";
import Typography from "@material-ui/core/Typography";
import { Skeleton } from "@material-ui/lab";

import classNames from "classnames";

import {
  useStateWithDynamicDefault,
  toMap,
  pkGetter,
  truncateMultilineString,
  formatTimestamp,
  copyTextToClipboard,
} from "../../utils";

import { Incident } from "../../api";
import { useStyles } from "../incident/styles";
import { AckedItem, OpenItem } from "../incident/Chips";
import IncidentDetails from "../incident/IncidentDetails";

import Modal from "../../components/modal/Modal";

import IncidentTableToolbar from "../../components/incidenttable/IncidentTableToolbar";

// Contexts/Hooks
import { useIncidentsContext } from "../incidentsprovider";
import { useAlerts } from "../alertsnackbar";

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
  isRealtime?: boolean;
  isLoadingRealtime?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginationComponent?: any;
};

const MUIIncidentTable: React.FC<MUIIncidentTablePropsType> = ({
  incidents,
  onShowDetail,
  isLoading,
  isRealtime = false,
  isLoadingRealtime = true,
  paginationComponent,
}: MUIIncidentTablePropsType) => {
  const style = useStyles();

  type SelectionState = Set<Incident["pk"]>;
  const [selectedIncidents, setSelectedIncidents] = useState<SelectionState>(new Set<Incident["pk"]>([]));

  type IncidentOrderableFields = Pick<Incident, "start_time">;

  // TODO: implement proper ordering/sorting when support
  // for this is implemented in the backend.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [order, setOrder] = React.useState<Order>("desc");
  // TODO: fix typing problems here without use of any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderBy, setOrderBy] = React.useState<keyof IncidentOrderableFields>("start_time");

  const handleRowClick = (event: React.MouseEvent<unknown>, incident: Incident) => {
    onShowDetail(incident);
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidents((oldSelectedIncidents: SelectionState) => {
      const newSelectedIncidents = new Set<Incident["pk"]>(oldSelectedIncidents);
      if (oldSelectedIncidents.has(incident.pk)) {
        newSelectedIncidents.delete(incident.pk);
      } else {
        newSelectedIncidents.add(incident.pk);
      }
      return newSelectedIncidents;
    });
  };

  const multiSelect = true;

  const handleClearSelection = useCallback(() => setSelectedIncidents(new Set<Incident["pk"]>([])), []);

  return (
    <Paper>
      {multiSelect && (
        <IncidentTableToolbar
          isLoading={isLoading}
          selectedIncidents={selectedIncidents}
          onClearSelection={handleClearSelection}
        />
      )}
      <TableContainer component={Paper}>
        <MuiTable size="small" aria-label="incident table">
          <TableHead>
            <TableRow
              className={classNames(
                style.tableRow,
                isRealtime
                  ? isLoadingRealtime
                    ? style.tableRowHeadRealtimeLoading
                    : style.tableRowHeadRealtime
                  : style.tableRowHeadNormal,
              )}
            >
              {multiSelect && <TableCell></TableCell>}
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isLoading &&
              [0, 1, 2, 3, 4, 5, 6].map((key: number) => {
                return (
                  <TableRow
                    hover
                    key={key}
                    selected={false}
                    style={{
                      cursor: "pointer",
                    }}
                    className={classNames(style.tableRow, style.tableRowLoading)}
                  >
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Skeleton>
                        <OpenItem small open />
                      </Skeleton>
                      <Skeleton>
                        <AckedItem small acked />
                      </Skeleton>
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                );
              })) ||
              stableSort<Incident>(incidents, getComparator<IncidentOrderableFields>(order, orderBy))
                //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((incident: Incident) => {
                  const ClickableCell = (props: TableCellProps) => (
                    <TableCell onClick={(event) => handleRowClick(event, incident)} {...props} />
                  );

                  const isSelected = selectedIncidents.has(incident.pk);

                  return (
                    <TableRow
                      hover
                      key={incident.pk}
                      selected={isSelected}
                      style={{
                        cursor: "pointer",
                      }}
                      className={classNames(
                        style.tableRow,
                        incident.open
                          ? incident.acked
                            ? style.tableRowAcked
                            : style.tableRowOpenUnacked
                          : style.tableRowClosed,
                      )}
                    >
                      {multiSelect && (
                        <TableCell padding="checkbox" onClick={() => handleSelectIncident(incident)}>
                          <Checkbox disabled={isLoading} checked={isSelected} />
                        </TableCell>
                      )}
                      <ClickableCell>{formatTimestamp(incident.start_time)}</ClickableCell>
                      <ClickableCell component="th" scope="row">
                        <OpenItem small open={incident.open} />
                        {/* <TicketItem small ticketUrl={incident.ticket_url} /> */}
                        <AckedItem small acked={incident.acked} />
                      </ClickableCell>
                      <ClickableCell>{incident.source.name}</ClickableCell>
                      <ClickableCell>{incident.description}</ClickableCell>
                      <TableCell>
                        <IconButton disabled={isLoading} component={Link} to={`/incidents/${incident.pk}/`}>
                          <OpenInNewIcon />
                        </IconButton>
                        {incident.ticket_url && (
                          <IconButton disabled={isLoading} href={incident.ticket_url}>
                            <TicketIcon />
                          </IconButton>
                        )}
                        {/* TODO: Not implementd yet */}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </MuiTable>
        {!isLoading && incidents.length === 0 && <Typography>No incidents</Typography>}
      </TableContainer>
      {paginationComponent}
    </Paper>
  );
};

export type MinimalIncidentTablePropsType = {
  isLoading: boolean;
  isRealtime: boolean;
  isLoadingRealtime: boolean;

  paginationComponent?: MUIIncidentTablePropsType["paginationComponent"];
};

export const MinimalIncidentTable = ({
  isLoading,
  isRealtime,
  isLoadingRealtime,
  paginationComponent,
}: MinimalIncidentTablePropsType) => {
  const displayAlert = useAlerts();

  const [{ incidents }, { incidentByPk, modifyIncident }] = useIncidentsContext();

  const [detailPk, setDetailPk] = useState<Incident["pk"] | undefined>(undefined);

  const handleShowDetail = (incident: Incident) => {
    setDetailPk(incident.pk);
  };

  const onModalClose = () => {
    setDetailPk(undefined);
  };

  const handleIncidentChange = (incident: Incident) => {
    modifyIncident(incident);
  };

  const detailModal = useMemo(() => {
    const pk = detailPk;

    if (pk === undefined) {
      return null;
    }

    const incident = incidentByPk(pk);
    if (incident === undefined) {
      return null;
    }

    const copyCanonicalUrlToClipboard = () => {
      if (detailPk) {
        const relativeUrl = `/incidents/${detailPk}/`;
        const canonicalUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;
        copyTextToClipboard(canonicalUrl);
        displayAlert("Copied URL to clipboard", "success");
      }
    };

    return (
      <Modal
        open
        title={`${detailPk}: ${truncateMultilineString(incident.description, 50)}`}
        onClose={onModalClose}
        content={<IncidentDetails onIncidentChange={handleIncidentChange} incident={incident} />}
        actions={
          <Button autoFocus onClick={copyCanonicalUrlToClipboard} color="primary">
            Copy URL
          </Button>
        }
        dialogProps={{ maxWidth: "lg", fullWidth: true }}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPk, displayAlert]);

  return (
    <ClickAwayListener onClickAway={onModalClose}>
      <div>
        {detailModal}
        <MUIIncidentTable
          isRealtime={isRealtime}
          isLoading={isLoading}
          isLoadingRealtime={isLoadingRealtime}
          incidents={incidents}
          onShowDetail={handleShowDetail}
          paginationComponent={paginationComponent}
        />
      </div>
    </ClickAwayListener>
  );
};
