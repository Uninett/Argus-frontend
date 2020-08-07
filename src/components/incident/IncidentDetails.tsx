import React, { useState, useMemo } from "react";
// import "./incidenttable.css";
import "react-table/react-table.css";

import Button from "@material-ui/core/Button";
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

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

import { useStateWithDynamicDefault } from "../../utils";

import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";
import { UseAlertSnackbarResultType } from "../../components/alertsnackbar";
import CenterContainer from "../../components/centercontainer";

import api, { Incident, Ack } from "../../api";

import SignedMessage from "./SignedMessage";
import SignOffAction from "./SignOffAction";
import { useStyles } from "./styles";

import { ActiveItem, AckedItem, TicketItem } from "../incident/Chips";

type IncidentDetailsListItemPropsType = {
  title: string;
  detail: string | React.ReactNode;
};

const IncidentDetailsListItem: React.FC<IncidentDetailsListItemPropsType> = ({
  title,
  detail,
}: IncidentDetailsListItemPropsType) => {
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
  small?: boolean;
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

const TagChip: React.FC<TagChipPropsType> = ({ tag, small }: TagChipPropsType) => {
  if (isValidUrl(tag.value)) {
    return (
      <Chip
        size={(small && "small") || undefined}
        label={`${tag.key}=${tag.value}`}
        component="a"
        href={tag.value}
        clickable
      />
    );
  }
  return <Chip size={(small && "small") || undefined} label={`${tag.key}=${tag.value}`} />;
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

type IncidentDetailsPropsType = {
  incident: Incident;
  onIncidentChange: (incident: Incident) => void;
  displayAlertSnackbar: UseAlertSnackbarResultType["displayAlertSnackbar"];
};

const IncidentDetails: React.FC<IncidentDetailsPropsType> = ({
  incident,
  onIncidentChange,
  displayAlertSnackbar,
}: IncidentDetailsPropsType) => {
  const classes = useStyles();

  // const [ticketUrl, setTicketUrl] = useState<string | undefined>(incident && incident.ticket_url);
  // const [active, setActive] = useState<boolean>((incident && incident.active) || false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //onst { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();
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
    api
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
    api
      .putIncidentActive(incident.pk, true)
      .then((incident: Incident) => {
        displayAlertSnackbar(`Reopened incident ${incident && incident.pk}`, "success");
        onIncidentChange(incident);
      })
      .catch((error) => {
        displayAlertSnackbar(`Failed to reopen incident ${incident && incident.pk} - ${error}`, "error");
      });
  };

  const ackExpiryDate = undefined;

  const tags = [
    { key: "test_url", value: "https://uninett.no" },
    { key: "test_host", value: "uninett.no" },
    { key: "host", value: "uninett.no" },
    { key: "timestamp", value: "123123123" },
    { key: "bytes", value: "askldfjalskdf" },
    { key: "origin_src", value: "something.tst" },
  ];

  // {incidentSnackbar}
  return (
    <div className={classes.root}>
      <Grid container spacing={3} className={classes.grid}>
        <Grid container item spacing={2} md alignItems="stretch" justify="space-evenly" direction="column">
          <Grid item>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <CenterContainer>
                  <ActiveItem active={incident.active} />
                  <AckedItem acked={true} expiresAt={ackExpiryDate} />
                  <TicketItem ticketUrl={incident.ticket_url} />
                </CenterContainer>
              </CardContent>
            </Card>
          </Grid>

          {!incident.active && (
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
                  <IncidentDetailsListItem title="Description" detail={incident.description} />
                  <IncidentDetailsListItem title="Start time" detail={incident.start_time} />
                  <IncidentDetailsListItem title="Source" detail={incident.source.name} />
                  <IncidentDetailsListItem
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
                          displayAlertSnackbar(`Updated ticket URL for ${incident.pk}`, "success");
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
                        active={incident.active}
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

export default IncidentDetails;
