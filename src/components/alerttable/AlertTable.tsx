import React, { useState } from "react";
import "./alerttable.css";
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
// import CardHeader from "@material-ui/core/CardHeader";

import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";

// TODO: remove alertWithFormattedTimestamp
// use regular alert instead.
import { AlertWithFormattedTimestamp, useStateWithDynamicDefault } from "../../utils";
import Table, {
  Accessor,
  getMaxColumnWidth,
  maxWidthColumn,
  calculateTableCellWidth,
  ConstraintFunction,
} from "../table/Table";

import { WHITE } from "../../colorscheme";
import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

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
  }),
);

type AlertDetailListItemPropsType = {
  title: string;
  detail: string;
};

const AlertDetailListItem: React.FC<AlertDetailListItemPropsType> = ({
  title,
  detail,
}: AlertDetailListItemPropsType) => {
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
};

const TicketModifiableField: React.FC<TicketModifiableFieldPropsType> = ({
  url: urlProp,
}: TicketModifiableFieldPropsType) => {
  const [changeUrl, setChangeUrl] = useState<boolean>(false);
  const [url, setUrl] = useStateWithDynamicDefault<string | undefined>(urlProp);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setChangeUrl(true);
  };

  if (url && !changeUrl) {
    return (
      <ListItem>
        <Grid container direction="row">
          <ListItemText primary="Ticket" secondary={url} />
          <Button endIcon={<EditIcon />} onClick={() => setChangeUrl(true)}>
            Edit
          </Button>
        </Grid>
      </ListItem>
    );
  }

  return (
    <ListItem>
      <div>
        <TextField
          label="Ticket"
          defaultValue={url || ""}
          InputProps={{
            readOnly: false,
          }}
          onChange={handleChange}
        />
        <Button onClick={() => setChangeUrl(false)}>Set ticket URL</Button>
      </div>
    </ListItem>
  );
};

type Timestamp = string;

type Ack = {
  user: string;
  timestamp: Timestamp;
  message: string;
  expiresAt: Timestamp | undefined | null;
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
    <ListItem style={{ textDecoration: hasExpired ? "line-through" : "none" }}>
      <Card className={classes.root}>
        {expiresMessage && <CardContent>{expiresMessage} </CardContent>}
        <CardContent>{ack.message}</CardContent>
        <CardContent>
          <Typography color="textSecondary" variant="body2">
            {ack.user} - {formattedAckDate}
          </Typography>
        </CardContent>
      </Card>
    </ListItem>
  );
};

type ActiveItemPropsType = {
  active: boolean;
};

const ActiveItem: React.FC<ActiveItemPropsType> = ({ active }: ActiveItemPropsType) => {
  return <Chip variant="outlined" color={active ? "primary" : "secondary"} label={active ? "Open" : "Closed"} />;
};

type AckedItemPropsType = {
  acked: boolean;
};

const AckedItem: React.FC<AckedItemPropsType> = ({ acked }: AckedItemPropsType) => {
  return (
    <Chip
      variant="outlined"
      color={acked ? "primary" : "secondary"}
      label={acked ? "Acknowledged" : "Unacknowledged"}
    />
  );
};

const ManualClose: React.FC<{}> = () => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      dangerousButton: {
        background: theme.palette.warning.main,
        color: WHITE,
      },
      safeButton: {
        background: theme.palette.primary.main,
        color: WHITE,
      },
    }),
  );

  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onConfirm = () => {
    handleClose();
    // TODO: close the incident/alert here.
  };

  const CloseButton = makeConfirmationButton({
    title: "Manual close of incident",
    question: "Are you sure you want to close this incident?",
    confirmName: "yes",
    rejectName: "no",
    onConfirm,
  });

  return (
    <div>
      <Button onClick={handleOpen} className={classes.dangerousButton}>
        Manual close
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Manual close of incident</DialogTitle>
        <DialogContent>
          <DialogContentText>Write a messsage describing why this incident was closed manually.</DialogContentText>
          <TextField autoFocus margin="dense" id="messsage" label="Messsage" type="text" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classes.safeButton}>
            Cancel
          </Button>
          <CloseButton variant="contained" className={classes.dangerousButton}>
            Close now
          </CloseButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

type AlertDetailPropsType = {
  alert?: AlertWithFormattedTimestamp;
};

const AlertDetail: React.FC<AlertDetailPropsType> = ({ alert }: AlertDetailPropsType) => {
  const classes = useStyles();

  if (!alert) return <h1>none</h1>;
  console.log("alert", alert);

  return (
    <div className={classes.root}>
      <Grid container direction="column" justify="flex-start" alignItems="flex-start">
        <Grid container spacing={2}>
          <Grid container direction="row" justify="flex-start" alignItems="flex-start">
            <ActiveItem active={alert.active_state} />
            <AckedItem acked={true} />
          </Grid>

          <Card>
            <Typography color="textSecondary" gutterBottom>
              Tags
            </Typography>
            <CardContent>
              <TagChip tag={{ key: "test_url", value: "https://uninett.no" }} />
              <TagChip tag={{ key: "test_host", value: "uninett.no" }} />
            </CardContent>
          </Card>

          <Card>
            <Typography color="textSecondary" gutterBottom>
              Primary details
            </Typography>
            <CardContent>
              <List>
                <AlertDetailListItem title="Description" detail={alert.description} />
                <AlertDetailListItem title="Timestamp" detail={alert.timestamp} />
                <AlertDetailListItem title="Source" detail={alert.source.name} />
                <AlertDetailListItem title="Parent object" detail={alert.parent_object.name} />
                <AlertDetailListItem title="Object" detail={alert.object.name} />
                <AlertDetailListItem title="Problem type" detail={alert.problem_type.name} />

                <TicketModifiableField url={alert.ticket_url} />
                <ListItem>
                  <ManualClose />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid container spacing={2}>
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

        <Grid container spacing={1}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Acknowledgements
              </Typography>
              <List>
                <AckListItem
                  ack={{
                    user: "testuser",
                    timestamp: "2020-01-15T03:04:14.387000+01:00",
                    message: "Ack ack",
                    expiresAt: null,
                  }}
                />
                <AckListItem
                  ack={{
                    user: "testuser2",
                    timestamp: "2020-01-14T03:04:14.387000+01:00",
                    message: "Ack nack ack",
                    expiresAt: "2020-02-14T03:04:14.387000+01:00",
                  }}
                />
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

type AlertsProps = {
  alerts: AlertWithFormattedTimestamp[];
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

const AlertTable: React.FC<AlertsProps> = ({ alerts }: AlertsProps) => {
  type A = AlertWithFormattedTimestamp;

  const [alertForDetail, setAlertForDetail] = useState<A | undefined>(undefined);

  const timestampCellWidth: ConstraintFunction<A> = () => calculateTableCellWidth("2015-11-14T03:04:14.387000+01:00");

  const showDetail = (alert: A) => {
    setAlertForDetail(alert);
  };

  const detailsAccessor: Accessor<A> = (row: A) => {
    return (
      <Button variant="contained" onClick={() => showDetail(row)}>
        Details
      </Button>
    );
  };

  const columns = [
    {
      id: "timestamp_col",
      ...maxWidthColumn<A>(alerts, "Timestamp", "timestamp", timestampCellWidth),
    },
    {
      id: "source_col",
      Cell: SourceDetailUrl,
      ...maxWidthColumn<A>(
        alerts,
        "Source",
        (alert: AlertWithFormattedTimestamp) => String(alert.source.name),
        getMaxColumnWidth,
      ),
    },
    {
      id: "problem_type_col",
      ...maxWidthColumn<A>(alerts, "Problem type", "problem_type.name", getMaxColumnWidth),
    },
    {
      id: "object_col",
      ...maxWidthColumn<A>(alerts, "Object", "object.name", getMaxColumnWidth),
    },
    {
      id: "parent_object_col",
      ...maxWidthColumn<A>(alerts, "Parent object", "parent_object.name", getMaxColumnWidth),
    },
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
    setAlertForDetail(undefined);
  };

  return (
    <ClickAwayListener onClickAway={onModalClose}>
      <div>
        <Dialog
          open={!!alertForDetail}
          onClose={() => setAlertForDetail(undefined)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
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
                  Alert Details
                </Typography>
              </Toolbar>
            </AppBar>
            <AlertDetail key={alertForDetail?.alert_id} alert={alertForDetail} />
          </div>
        </Dialog>
        <Table data={alerts} columns={columns} sorted={[{ id: "timestamp_col", desc: true }]} />
      </div>
    </ClickAwayListener>
  );
};

export default AlertTable;
