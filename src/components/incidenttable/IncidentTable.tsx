import React, {useState, useMemo, useCallback} from "react";

import { Link } from "react-router-dom";

import './incidenttable.css';

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

// Api
import type { Incident } from "../../api/types.d";

import { formatTimestamp, copyTextToClipboard } from "../../utils";

import { useStyles } from "../incident/styles";
import { AckedItem, LevelItem, OpenItem } from "../incident/Chips";
import IncidentDetails from "../incident/IncidentDetails";

import Modal from "../../components/modal/Modal";

import IncidentTableToolbar from "../../components/incidenttable/IncidentTableToolbar";

// Contexts/Hooks
import { useIncidentsContext } from "../incidentsprovider";
import { useAlerts } from "../alertsnackbar";
import { SHOW_SEVERITY_LEVELS } from "../../config";
import {Collapse, Hidden, Box} from "@material-ui/core";
import {KeyboardArrowDown, KeyboardArrowUp} from "@material-ui/icons";

import {useMediaQuery} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

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
  currentPage: number;
};

const MUIIncidentTable: React.FC<MUIIncidentTablePropsType> = ({
  incidents,
  onShowDetail,
  isLoading,
  isRealtime = false,
  isLoadingRealtime = true,
  paginationComponent,
  currentPage
}: MUIIncidentTablePropsType) => {
  const style = useStyles();

  type SelectionState = Set<Incident["pk"]>;
  type RowExpansionState = Set<Incident["pk"]>;
  const [selectedIncidents, setSelectedIncidents] = useState<SelectionState>(new Set<Incident["pk"]>([]));
  const [expandedIncidents, setExpandedIncidents] = useState<RowExpansionState>(new Set<Incident["pk"]>([]));
  const [isSelectAll, setIsSelectAll] = useState<Map<number, boolean>>(new Map<number, boolean>([[currentPage, false]]));

  type IncidentOrderableFields = Pick<Incident, "start_time">;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [order, setOrder] = React.useState<Order>("desc");
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


  const handleSelectAllIncidents = () => {
    setSelectedIncidents((oldSelectedIncidents: SelectionState) => {
      const newSelectedIncidents = new Set<Incident["pk"]>(oldSelectedIncidents);
      if (isSelectAll.get(currentPage)) {
        setIsSelectAll(() => {
          const newPageSelectionStatus = new Map<number, boolean>(isSelectAll);
          newPageSelectionStatus.set(currentPage, false);
          return newPageSelectionStatus;
        });
        incidents.map((i) => newSelectedIncidents.delete(i.pk))
        return newSelectedIncidents;
      } else {
        setIsSelectAll(() => {
          const newPageSelectionStatus = new Map<number, boolean>(isSelectAll);
          newPageSelectionStatus.set(currentPage, true);
          return newPageSelectionStatus;
        });
        incidents.map((i) => newSelectedIncidents.add(i.pk))
        return newSelectedIncidents;
      }
    });
  };

  const handleExpandIncident = (incident: Incident) => {
    setExpandedIncidents((oldExpandedIncidents: RowExpansionState) => {
      const newExpandedIncidents = new Set<Incident["pk"]>(oldExpandedIncidents);
      if (oldExpandedIncidents.has(incident.pk)) {
        newExpandedIncidents.delete(incident.pk);
      } else {
        newExpandedIncidents.add(incident.pk);
      }
      return newExpandedIncidents;
    });
  };

  const multiSelect = true;

  const handleClearSelection = useCallback(() => {
    setSelectedIncidents(new Set<Incident["pk"]>([]))
    setIsSelectAll(() => {
      const newPageSelectionStatus = new Map<number, boolean>(isSelectAll);
      newPageSelectionStatus.set(currentPage, false);
      return newPageSelectionStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper>
      {multiSelect && (
        <IncidentTableToolbar
          isLoading={isLoading}
          selectedIncidents={selectedIncidents}
          onClearSelection={handleClearSelection}
        />
      )}
      <TableContainer component={Paper} className="incidents-table-mui-container">
        <MuiTable size="small" aria-label="incident table" className="incidents-table">
            <TableHead className="lg-xl-header">
              <TableRow
                className={`${classNames(
                  style.tableRow,
                  isRealtime
                    ? isLoadingRealtime
                      ? style.tableRowHeadRealtimeLoading
                      : style.tableRowHeadRealtime
                    : style.tableRowHeadNormal,
                )} incidents-table-row incidents-table-header-row`}
              >
                {multiSelect &&
                    <TableCell
                        padding="checkbox"
                        onClick={() => handleSelectAllIncidents()}
                    >
                      <Checkbox
                          disabled={isLoading}
                          checked={isSelectAll.get(currentPage)}
                      />
                    </TableCell>
                }

                <TableCell className="timestamp-cell">Timestamp</TableCell>
                <TableCell>Status</TableCell>
                {SHOW_SEVERITY_LEVELS && <TableCell>Severity level</TableCell>}
                <TableCell>Source</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

          <Hidden only={['xs', 'md', 'lg', 'xl']}>
            <TableHead className="table-head">
              <TableRow
                className={`${classNames(
                  style.tableRow,
                  isRealtime
                    ? isLoadingRealtime
                      ? style.tableRowHeadRealtimeLoading
                      : style.tableRowHeadRealtime
                    : style.tableRowHeadNormal,
                )} incidents-table-row incidents-table-header-row`}
              >
                {multiSelect &&
                    <TableCell
                        padding="checkbox"
                        onClick={() => handleSelectAllIncidents()}
                    >
                      <Checkbox
                          disabled={isLoading}
                          checked={isSelectAll.get(currentPage)}
                      />
                    </TableCell>
                }

                <TableCell className="timestamp-cell">Time</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
          </Hidden>

          <Hidden only={['sm', 'md', 'lg', 'xl']}>
            <TableHead className="table-head">
              <TableRow
                className={`${classNames(
                  style.tableRow,
                  isRealtime
                    ? isLoadingRealtime
                      ? style.tableRowHeadRealtimeLoading
                      : style.tableRowHeadRealtime
                    : style.tableRowHeadNormal,
                )} incidents-table-row incidents-table-header-row`}
              >
                {multiSelect &&
                    <TableCell
                        padding="checkbox"
                        onClick={() => handleSelectAllIncidents()}
                    >
                      <Checkbox
                          disabled={isLoading}
                          checked={isSelectAll.get(currentPage)}
                      />
                    </TableCell>
                }

                <TableCell className="timestamp-cell">Time</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Source</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          </Hidden>

          <TableBody>
            {(isLoading &&
              [0, 1, 2, 3, 4, 5, 6, 7].map((key: number) => {
                return (
                  <TableRow
                    hover
                    key={key}
                    selected={false}
                    style={{
                      cursor: "pointer",
                    }}
                    className={`${classNames(style.tableRow, style.tableRowLoading)} incidents-table-row`}
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
                  const isExpanded = expandedIncidents.has(incident.pk);

                  return (
                    <>
                        <TableRow
                          hover
                          key={incident.pk}
                          selected={isSelected}
                          style={{
                            cursor: "pointer",
                          }}
                          className={`${classNames(
                            style.tableRow,
                            incident.open
                              ? incident.acked
                                ? style.tableRowAcked
                                : style.tableRowOpenUnacked
                              : style.tableRowClosed,
                          )} incidents-table-row lg-xl-row`}
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
                          {SHOW_SEVERITY_LEVELS && (
                            <ClickableCell>
                              <LevelItem small level={incident.level} />
                            </ClickableCell>
                          )}
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
                          </TableCell>
                        </TableRow>

                      <Hidden only={['xs', 'md', 'lg', 'xl']}>
                        <TableRow
                          hover
                          key={incident.pk}
                          selected={isSelected}
                          style={{
                            cursor: "pointer",
                          }}
                          className={`${classNames(
                            style.tableRow,
                            incident.open
                              ? incident.acked
                                ? style.tableRowAcked
                                : style.tableRowOpenUnacked
                              : style.tableRowClosed,
                          )} incidents-table-row`}
                        >
                          {multiSelect && (
                            <TableCell className="checkbox-cell" onClick={() => handleSelectIncident(incident)}>
                              <Checkbox disabled={isLoading} checked={isSelected} />
                            </TableCell>
                          )}
                          <ClickableCell className="timestamp-cell">{formatTimestamp(incident.start_time)}</ClickableCell>
                          <ClickableCell className="state-cell" component="th" scope="row">
                            <div className="state-cell-contents">
                              {SHOW_SEVERITY_LEVELS && (
                                <LevelItem small level={incident.level} />
                              )}
                              <OpenItem small open={incident.open} />
                              {/* <TicketItem small ticketUrl={incident.ticket_url} /> */}
                              <AckedItem small acked={incident.acked} />
                            </div>
                          </ClickableCell>
                          <TableCell className="actions-cell">
                            <IconButton disabled={isLoading} component={Link} to={`/incidents/${incident.pk}/`}>
                              <OpenInNewIcon />
                            </IconButton>
                            {incident.ticket_url && (
                              <IconButton disabled={isLoading} href={incident.ticket_url}>
                                <TicketIcon />
                              </IconButton>
                            )}
                          </TableCell>
                          <ClickableCell className="source-cell">{incident.source.name}</ClickableCell>
                          <ClickableCell className="description-cell">{incident.description}</ClickableCell>
                        </TableRow>
                      </Hidden>

                      <Hidden only={['sm', 'md', 'lg', 'xl']}>
                        <TableRow
                          hover
                          key={incident.pk}
                          selected={isSelected}
                          style={{
                            cursor: "pointer",
                          }}
                          className={`${classNames(
                            style.tableRow,
                            incident.open
                              ? incident.acked
                                ? style.tableRowAcked
                                : style.tableRowOpenUnacked
                              : style.tableRowClosed,
                          )} incidents-table-row`}
                        >
                          {multiSelect && (
                            <TableCell className="checkbox-cell" onClick={() => handleSelectIncident(incident)}>
                              <Checkbox disabled={isLoading} checked={isSelected} />
                            </TableCell>
                          )}
                          <ClickableCell className="timestamp-cell">{formatTimestamp(incident.start_time)}</ClickableCell>
                          <ClickableCell className="state-cell" component="th" scope="row">
                            <div className="state-cell-contents">
                              {SHOW_SEVERITY_LEVELS && (
                                <LevelItem small level={incident.level} />
                              )}
                              <OpenItem small open={incident.open} />
                              {/* <TicketItem small ticketUrl={incident.ticket_url} /> */}
                              <AckedItem small acked={incident.acked} />
                            </div>
                          </ClickableCell>

                          <TableCell className="source-cell source-ticket-cell">
                            <Typography variant="body2" className="source-cell">{incident.source.name}</Typography>
                            {incident.ticket_url && (
                              <IconButton disabled={isLoading} href={incident.ticket_url}>
                                <TicketIcon />
                              </IconButton>
                            )}
                          </TableCell>

                          <TableCell>
                            <IconButton aria-label="expand row" size="small" onClick={() => handleExpandIncident(incident)}>
                              {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </TableCell>

                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box margin={1}>
                                <MuiTable size="small" aria-label="additional-xs-incident-data">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align="left">Description</TableCell>
                                      <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <ClickableCell align="left" className="description-cell">{incident.description}</ClickableCell>
                                    <TableCell align="right" className="actions-cell">
                                      <IconButton disabled={isLoading} component={Link} to={`/incidents/${incident.pk}/`}>
                                        <OpenInNewIcon />
                                      </IconButton>
                                      {incident.ticket_url && (
                                        <IconButton disabled={isLoading} href={incident.ticket_url}>
                                          <TicketIcon />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                  </TableBody>
                                </MuiTable>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Hidden>
                    </>

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
  currentPage: number;
};

export const MinimalIncidentTable = ({
  isLoading,
  isRealtime,
  isLoadingRealtime,
  paginationComponent,
  currentPage
}: MinimalIncidentTablePropsType) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const displayAlert = useAlerts();

  const [{ incidents }, { incidentByPk, modifyIncident }] = useIncidentsContext();

  const [detailPk, setDetailPk] = useState<Incident["pk"] | undefined>(undefined);

  const handleShowDetail = (incident: Incident) => {
    setDetailPk(incident.pk);
  };

  const onModalClose = () => {
    setDetailPk(undefined);
  };

  const copyCanonicalUrlToClipboard = useCallback(() => {
    if (detailPk) {
      const relativeUrl = `/incidents/${detailPk}/`;
      const canonicalUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;
      copyTextToClipboard(canonicalUrl);
      displayAlert("Copied URL to clipboard", "success");
    }
  }, [detailPk, displayAlert]);

  type ModalDetails = {
    title: string;
    open: boolean;
    incident: Incident | undefined;
    content: React.ReactNode | undefined;
  };
  const modalDetails: ModalDetails = useMemo((): ModalDetails => {
    const defaultDetails: ModalDetails = { title: "", open: false, incident: undefined, content: undefined };
    if (detailPk === undefined) return defaultDetails;
    const incident = incidentByPk(detailPk);
    if (incident === undefined) return defaultDetails;

    return {
      title: `${incident.pk}: ${incident.description}`,
      open: true,
      incident: incident,
      content: (
        <IncidentDetails onIncidentChange={(incident: Incident) => modifyIncident(incident)} incident={incident} />
      ),
    };
  }, [detailPk, incidentByPk, modifyIncident]);

  return (
    <ClickAwayListener onClickAway={onModalClose}>
      <div>
        <Modal
          truncateTitle
          open={modalDetails.open}
          title={modalDetails.title}
          onClose={onModalClose}
          content={modalDetails.content}
          actions={
            <Button autoFocus onClick={copyCanonicalUrlToClipboard} color="primary">
              Copy URL
            </Button>
          }
          dialogProps={{ maxWidth: "lg", fullWidth: true , fullScreen: fullScreen}}
        />
        <MUIIncidentTable
          isRealtime={isRealtime}
          isLoading={isLoading}
          isLoadingRealtime={isLoadingRealtime}
          incidents={incidents}
          onShowDetail={handleShowDetail}
          paginationComponent={paginationComponent}
          currentPage={currentPage}
        />
      </div>
    </ClickAwayListener>
  );
};
