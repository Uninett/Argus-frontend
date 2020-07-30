import React, { useState, useMemo } from "react";
import "./incidenttable.css";
import "react-table/react-table.css";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import Grid from "@material-ui/core/Grid";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Chip from "@material-ui/core/Chip";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

// TODO: remove incidentWithFormattedTimestamp
// use regular incident instead.
import { useStateWithDynamicDefault, toMap, pkGetter } from "../../utils";
import Table, {
  Accessor,
  getMaxColumnWidth,
  maxWidthColumn,
  calculateTableCellWidth,
  ConstraintFunction,
} from "../table/Table";

import { WHITE } from "../../colorscheme";
import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";
import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";
import CenterContainer from "../../components/centercontainer";

import api, { Incident, Ack, Timestamp } from "../../api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    closeIcon: {
      marginRight: theme.spacing(2),
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    grid: {
      "flex-wrap": "wrap",
      "align-items": "stretch",
      "align-content": "stretch",
    },
    dangerousButton: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    safeButton: {
      background: theme.palette.primary.main,
      color: WHITE,
    },
    closed: {
      background: theme.palette.success.main,
      color: WHITE,
    },
    open: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    acknowledged: {
      background: theme.palette.success.main,
      color: WHITE,
    },
    unacknowledged: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    notticketed: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    ticketed: {
      background: theme.palette.success.main,
      color: WHITE,
    },
    message: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[2],
      padding: theme.spacing(2, 4, 3),
    },
    closedMessage: {
      backgroundColor: theme.palette.success.main,
      color: WHITE,
    },
  }),
);

type IncidentDetailListItemPropsType = {
  title: string;
  detail: string | React.ReactNode;
};

const IncidentDetailListItem: React.FC<IncidentDetailListItemPropsType> = ({
  title,
  detail,
}: IncidentDetailListItemPropsType) => {
  return (
    <ListItem>
      <ListItemText primary={title} secondary={detail} />
    </ListItem>
  );
};

type Event = {
  name: string;
};

type EventListItemPropsType = {
  event: Event;
};

const EventListItem: React.FC<EventListItemPropsType> = ({ event }: EventListItemPropsType) => {
  return (
    <ListItem>
      <ListItemText primary="Name" secondary={event.name} />
    </ListItem>
  );
};

type Tag = {
  key: string;
  value: string;
};

type TagChipPropsType = {
  tag: Tag;
};

const isValidUrl = (url: string) => {
  // Pavlo's answer at
  // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
  try {
    new URL(url);
  } catch (_) {
    return false;
  }
  return true;
};

const TagChip: React.FC<TagChipPropsType> = ({ tag }: TagChipPropsType) => {
  if (isValidUrl(tag.value)) {
    return <Chip label={`${tag.key}=${tag.value}`} component="a" href={tag.value} clickable />;
  }
  return <Chip label={`${tag.key}=${tag.value}`} />;
};

type TicketModifiableFieldPropsType = {
  url?: string;
  saveChange: (newUrl?: string) => void;
};

const TicketModifiableField: React.FC<TicketModifiableFieldPropsType> = ({
  url: urlProp,
  saveChange,
}: TicketModifiableFieldPropsType) => {
  const classes = useStyles();

  const [changeUrl, setChangeUrl] = useState<boolean>(false);
  const [url, setUrl] = useStateWithDynamicDefault<string | undefined>(urlProp);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setChangeUrl(true);
  };

  const handleSave = () => {
    // If url is empty string ("") store it as undefined.
    if (url !== undefined && changeUrl) saveChange(url || undefined);
    setChangeUrl(false);
  };

  const error = useMemo(() => !isValidUrl(url || ""), [url]);

  return (
    <ListItem>
      <Grid container direction="row" justify="space-between">
        <TextField
          label="Ticket"
          defaultValue={url || ""}
          InputProps={{
            readOnly: !changeUrl,
          }}
          onChange={handleChange}
          error={error}
          helperText={error && "Invalid URL"}
        />
        {(!changeUrl && (
          <Button endIcon={<EditIcon />} onClick={() => setChangeUrl(true)}>
            Edit
          </Button>
        )) || (
          <Button className={classes.safeButton} onClick={() => handleSave()} disabled={error}>
            Set ticket URL
          </Button>
        )}
      </Grid>
    </ListItem>
  );
};

type SignedMessagePropsType = {
  message: string;
  user: string;
  timestamp: Timestamp;

  content?: React.ReactNode;
  TextComponent?: React.ComponentType;
};

const SignedMessage: React.FC<SignedMessagePropsType> = ({
  message,
  user,
  timestamp,
  content,
  TextComponent,
}: SignedMessagePropsType) => {
  const ackDate = new Date(timestamp);
  const formattedAckDate = ackDate.toLocaleString();

  const Component: React.ComponentType = TextComponent || ListItemText;

  return (
    <Grid container direction="column" spacing={2}>
      {content || <Component>{message}</Component>}

      <Grid container direction="row" spacing={2}>
        <Grid item sm>
          <Component>{user}</Component>
        </Grid>
        <Grid item container sm alignItems="flex-end" justify="space-evenly">
          <Component>{formattedAckDate}</Component>
        </Grid>
      </Grid>
    </Grid>
  );
};

type AckListItemPropsType = {
  ack: Ack;
};

const AckListItem: React.FC<AckListItemPropsType> = ({ ack }: AckListItemPropsType) => {
  const classes = useStyles();

  const ackDate = new Date(ack.timestamp);
  const formattedAckDate = ackDate.toLocaleString();

  let hasExpired = false;
  let expiresMessage;
  if (ack.expiresAt) {
    const date = new Date(ack.expiresAt);
    if (Date.parse(ack.expiresAt) < Date.now()) {
      expiresMessage = `Expired ${date.toLocaleString()}`;
      hasExpired = true;
    } else {
      expiresMessage = `Expires ${date.toLocaleString()}`;
    }
  }

  return (
    <div className={classes.message}>
      <SignedMessage
        message={ack.message}
        timestamp={formattedAckDate}
        user={ack.user}
        content={
          <ListItemText
            primary={expiresMessage || ""}
            secondary={
              <Typography paragraph style={{ textDecoration: hasExpired ? "line-through" : "none" }}>
                {ack.message}
              </Typography>
            }
          />
        }
      />
    </div>
  );
};

type ActiveItemPropsType = {
  active: boolean;
};

const ActiveItem: React.FC<ActiveItemPropsType> = ({ active }: ActiveItemPropsType) => {
  const classes = useStyles();
  return (
    <Chip variant="outlined" className={active ? classes.open : classes.closed} label={active ? "Open" : "Closed"} />
  );
};

type AckedItemPropsType = {
  acked: boolean;
  expiresAt?: Timestamp | null;
};

const AckedItem: React.FC<AckedItemPropsType> = ({ acked, expiresAt }: AckedItemPropsType) => {
  const classes = useStyles();

  const expiryDate = expiresAt && new Date(expiresAt);
  return (
    <Chip
      className={acked ? classes.acknowledged : classes.unacknowledged}
      label={acked ? (expiryDate ? `Acknowledged until ${expiryDate}` : "Acknowledged") : "Unacknowledged"}
    />
  );
};

type TicketItemPropsType = {
  ticketUrl?: string;
};

const TicketItem: React.FC<TicketItemPropsType> = ({ ticketUrl }: TicketItemPropsType) => {
  const classes = useStyles();

  const chipProps =
    (ticketUrl && {
      component: "a",
      href: ticketUrl,
      clickable: true,
    }) ||
    {};

  return (
    <Chip
      variant="outlined"
      className={ticketUrl ? classes.ticketed : classes.notticketed}
      label={ticketUrl ? `Ticket ${ticketUrl}` : "No ticket"}
      {...chipProps}
    />
  );
};

type SignOffActionPropsType = {
  dialogTitle: string;
  dialogContentText: string;
  dialogCancelText: string;
  dialogSubmitText: string;
  dialogButtonText: string;
  title: string;
  question: string;
  confirmName?: string;
  rejectName?: string;
  onSubmit: (msg: string) => void;
  children?: React.Props<{}>["children"];
};

const SignOffAction: React.FC<SignOffActionPropsType> = ({
  dialogTitle,
  dialogContentText,
  dialogCancelText,
  dialogSubmitText,
  dialogButtonText,
  title,
  question,
  confirmName,
  rejectName,
  onSubmit,
  children,
}: SignOffActionPropsType) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onConfirm = () => {
    handleClose();
    if (message) onSubmit(message);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value);

  const CloseButton = makeConfirmationButton({
    title,
    question,
    confirmName,
    rejectName,
    onConfirm,
  });

  return (
    <div>
      <Button onClick={handleOpen} className={classes.dangerousButton}>
        {dialogButtonText}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContentText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="messsage"
            label="Messsage"
            type="text"
            fullWidth
            value={message || ""}
            onChange={handleMessageChange}
          />
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classes.safeButton}>
            {dialogCancelText}
          </Button>
          <CloseButton onClick={onConfirm} variant="contained" className={classes.dangerousButton}>
            {dialogSubmitText}
          </CloseButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

type ManualClosePropsType = {
  active: boolean;
  onManualClose: (msg: string) => void;
  onManualOpen: () => void;
};

const ManualClose: React.FC<ManualClosePropsType> = ({ active, onManualClose, onManualOpen }: ManualClosePropsType) => {
  const classes = useStyles();

  if (active) {
    return (
      <SignOffAction
        dialogTitle="Manually close incident"
        dialogContentText="Write a message describing why the incident was manually closed"
        dialogSubmitText="Close now"
        dialogCancelText="Cancel"
        dialogButtonText="Close incident"
        title="Manually close incident"
        question="Are you sure you want to close this incident?"
        onSubmit={onManualClose}
      />
    );
  } else {
    const ReopenButton = makeConfirmationButton({
      title: "Reopen incident",
      question: "Are you sure you want to reopen this incident?",
      onConfirm: onManualOpen,
    });

    return (
      <ReopenButton variant="contained" className={classes.dangerousButton}>
        Reopen incident
      </ReopenButton>
    );
  }
};

type CreateAckPropsType = {
  onSubmitAck: (ack: Ack) => void;
};

const CreateAck: React.FC<CreateAckPropsType> = ({ onSubmitAck }: CreateAckPropsType) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = (msg: string) => {
    // TODO: switch to use API when implemented in backend
    onSubmitAck({
      user: "test",
      message: msg,
      timestamp: new Date().toUTCString(),
      expiresAt: selectedDate && selectedDate.toUTCString(),
    });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <SignOffAction
      dialogTitle="Submit acknowledment"
      dialogContentText="Write a message describing why this incident was acknowledged "
      dialogSubmitText="Submit"
      dialogCancelText="Cancel"
      dialogButtonText="Create acknowledegment"
      title="Submit acknowledment"
      question="Are you sure you want to acknowledge this incident?"
      onSubmit={handleSubmit}
    >
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          format="MM/dd/yyyy"
          margin="normal"
          id="expiry-date"
          label="Expiry date"
          value={selectedDate}
          onChange={handleDateChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
      </MuiPickersUtilsProvider>
    </SignOffAction>
  );
};

type IncidentDetailPropsType = {
  incident?: Incident;
  onIncidentChange: (incident: Incident) => void;
};

const IncidentDetail: React.FC<IncidentDetailPropsType> = ({ incident, onIncidentChange }: IncidentDetailPropsType) => {
  const classes = useStyles();

  // const [ticketUrl, setTicketUrl] = useState<string | undefined>(incident && incident.ticket_url);
  // const [active, setActive] = useState<boolean>((incident && incident.active_state) || false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();
  // TODO: handle close message

  const defaultAcks = [
    {
      user: "testuser2",
      timestamp: "2020-01-14T03:04:14.387000+01:00",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vulputate id erat non pretium.",
      expiresAt: "2020-02-14T03:04:14.387000+01:00",
    },
    {
      user: "testuser",
      timestamp: "2020-01-15T03:04:14.387000+01:00",
      message: "Ack ack",
      expiresAt: null,
    },
  ];

  const [acks, setAcks] = useState<Ack[]>(defaultAcks);

  const chronoAcks = useMemo<Ack[]>(() => {
    return [...acks].sort((first: Ack, second: Ack) => {
      const firstTime = Date.parse(first.timestamp);
      const secondTime = Date.parse(second.timestamp);
      if (firstTime < secondTime) {
        return 1;
      } else if (firstTime > secondTime) {
        return -1;
      }
      if (first.expiresAt && second.expiresAt) {
        const firstExpires = Date.parse(first.expiresAt);
        const secondExpires = Date.parse(second.expiresAt);
        return firstExpires < secondExpires ? 1 : firstExpires > secondExpires ? -1 : 0;
      }
      return first.expiresAt ? 1 : -1;
    });
  }, [acks]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleManualClose = (msg: string) => {
    if (!incident) return;
    api // eslint-disable-next-line @typescript-eslint/camelcase
      .putIncidentActive(incident.pk, false)
      .then((incident: Incident) => {
        displayAlertSnackbar(`Closed incident ${incident && incident.pk}`, "success");
        onIncidentChange(incident);
      })
      .catch((error) => {
        displayAlertSnackbar(`Failed to close incident ${incident && incident.pk} - ${error}`, "error");
      });
  };

  const handleManualOpen = () => {
    if (!incident) return;
    api // eslint-disable-next-line @typescript-eslint/camelcase
      .putIncidentActive(incident.pk, true)
      .then((incident: Incident) => {
        displayAlertSnackbar(`Reopened incident ${incident && incident.pk}`, "success");
        onIncidentChange(incident);
      })
      .catch((error) => {
        displayAlertSnackbar(`Failed to reopen incident ${incident && incident.pk} - ${error}`, "error");
      });
  };

  if (!incident) return <h1>none</h1>;

  const ackExpiryDate = undefined;

  const tags = [
    { key: "test_url", value: "https://uninett.no" },
    { key: "test_host", value: "uninett.no" },
    { key: "host", value: "uninett.no" },
    { key: "timestamp", value: "123123123" },
    { key: "bytes", value: "askldfjalskdf" },
    { key: "origin_src", value: "something.tst" },
  ];

  return (
    <div className={classes.root}>
      {incidentSnackbar}
      <Grid container spacing={3} className={classes.grid}>
        <Grid container item spacing={2} md alignItems="stretch" justify="space-evenly" direction="column">
          <Grid item>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <CenterContainer>
                  <ActiveItem active={incident.active_state} />
                  <AckedItem acked={true} expiresAt={ackExpiryDate} />
                  <TicketItem ticketUrl={incident.ticket_url} />
                </CenterContainer>
              </CardContent>
            </Card>
          </Grid>

          {!incident.active_state && (
            <Grid item>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Incident closed
                  </Typography>
                  <SignedMessage
                    message={"Incident was resolved on servicerestart"}
                    content={<Typography paragraph>Incident was resolved on servicerestart</Typography>}
                    timestamp={new Date().toUTCString()}
                    user={"you"}
                    TextComponent={Typography}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tags
                </Typography>
                {tags.map((tag: Tag) => (
                  <TagChip key={tag.key} tag={tag} />
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Primary details
                </Typography>
                <List>
                  <IncidentDetailListItem title="Description" detail={incident.description} />
                  <IncidentDetailListItem title="Timestamp" detail={incident.timestamp} />
                  <IncidentDetailListItem title="Source" detail={incident.source.name} />
                  <IncidentDetailListItem
                    title="Details URL"
                    detail={<a href={incident.details_url}>{incident.details_url}</a>}
                  />

                  <TicketModifiableField
                    url={incident.ticket_url}
                    saveChange={(url?: string) => {
                      // TODO: api
                      api
                        .putIncidentTicketUrl(incident.pk, url || "")
                        .then((incident: Incident) => {
                          displayAlertSnackbar(`Updated ticket URL for ${incident && incident.pk}`, "success");
                          onIncidentChange(incident);
                        })
                        .catch((error) => {
                          displayAlertSnackbar(`Failed to updated ticket URL ${error}`, "error");
                        });
                    }}
                  />
                  <ListItem>
                    <CenterContainer>
                      <ManualClose
                        active={incident.active_state}
                        onManualClose={handleManualClose}
                        onManualOpen={handleManualOpen}
                      />
                    </CenterContainer>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container item spacing={2} md direction="column">
          <Grid item>
            <Typography color="textSecondary" gutterBottom>
              Acknowledgements
            </Typography>
            <List>
              {chronoAcks.map((ack: Ack) => (
                <AckListItem key={ack.timestamp} ack={ack} />
              ))}
            </List>
            <CenterContainer>
              <CreateAck
                key={acks.length}
                onSubmitAck={(ack: Ack) => {
                  // TODO: handle ack submit here
                  console.log(ack);
                  api
                    .postAck(ack)
                    .then((ack: Ack) => {
                      displayAlertSnackbar(`Submitted ack for ${incident && incident.pk}`, "success");
                      setAcks([...acks, ack]);
                    })
                    .catch((error) => {
                      displayAlertSnackbar(`Failed to post ack ${error}`, "error");
                    });
                }}
              />
            </CenterContainer>
          </Grid>
          <Grid item>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Related events
                </Typography>
                <List>
                  <EventListItem event={{ name: "test event #1" }} />
                  <EventListItem event={{ name: "test event #1" }} />
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

type IncidentsProps = {
  incidents: Incident[];
  noDataText: string;
};

const SourceDetailUrl = (row: { value: string; original: { details_url: string } }) => {
  return (
    <a href={row.original.details_url} rel="noopener noreferrer" target="_blank">
      {" "}
      {row.value}{" "}
    </a>
  );
};

const IncidentTable: React.FC<IncidentsProps> = ({ incidents }: IncidentsProps) => {
  const [incidentForDetail, setIncidentForDetail] = useState<Incident | undefined>(undefined);

  const incidentsDictFromProps = useMemo<Map<Incident["pk"], Incident>>(
    () => toMap<Incident["pk"], Incident>(incidents, pkGetter),
    [incidents],
  );

  const [incidentsDict, setIncidentsDict] = useStateWithDynamicDefault<Map<Incident["pk"], Incident>>(
    incidentsDictFromProps,
  );

  const timestampCellWidth: ConstraintFunction<Incident> = () =>
    calculateTableCellWidth("2015-11-14T03:04:14.387000+01:00");

  const showDetail = (incident: Incident) => {
    setIncidentForDetail(incident);
  };

  const detailsAccessor: Accessor<Incident> = (row: Incident) => {
    return (
      <Button variant="contained" onClick={() => showDetail(row)}>
        Details
      </Button>
    );
  };

  const columns = [
    {
      id: "timestamp_col",
      ...maxWidthColumn<Incident>(incidents, "Timestamp", "timestamp", timestampCellWidth),
    },
    {
      id: "source_col",
      Cell: SourceDetailUrl,
      ...maxWidthColumn<Incident>(
        incidents,
        "Source",
        (incident: Incident) => String(incident.source.name),
        getMaxColumnWidth,
      ),
    },
    // {
    //   id: "problem_type_col",
    //   ...maxWidthColumn<A>(incidents, "Problem type", "problem_type.name", getMaxColumnWidth),
    // },
    // {
    //   id: "object_col",
    //   ...maxWidthColumn<A>(incidents, "Object", "object.name", getMaxColumnWidth),
    // },
    // {
    //   id: "parent_object_col",
    //   ...maxWidthColumn<A>(incidents, "Parent object", "parent_object.name", getMaxColumnWidth),
    // },
    {
      id: "description_col",
      Header: "Description",
      accessor: "description",
    },
    {
      id: "details_col",
      Header: "Details",
      accessor: detailsAccessor,
    },
  ];

  const classes = useStyles();

  const onModalClose = () => {
    setIncidentForDetail(undefined);
  };

  const handleIncidentChange = (incident: Incident) => {
    setIncidentsDict((oldDict: Map<Incident["pk"], Incident>) => {
      const newDict = new Map<Incident["pk"], Incident>(oldDict);
      const oldIncident = oldDict.get(incident.pk);
      if (!oldIncident || incident.active_state != oldIncident.active_state) {
        if (!incident.active_state) {
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
      return newDict;
    });
    setIncidentForDetail(incident);
  };

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
                  Incident Details
                </Typography>
              </Toolbar>
            </AppBar>
            <IncidentDetail
              key={incidentForDetail?.pk}
              onIncidentChange={handleIncidentChange}
              incident={incidentForDetail}
            />
          </div>
        </Dialog>
        <Table data={[...incidentsDict.values()]} columns={columns} sorted={[{ id: "timestamp_col", desc: true }]} />
      </div>
    </ClickAwayListener>
  );
};

export default IncidentTable;
