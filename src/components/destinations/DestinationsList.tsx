import React, { useEffect } from "react";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

import clsx from "clsx";
import { makeStyles, useTheme, Theme, createStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import { Destination, DestinationRequest, Media, NewDestination } from "../../api/types";

import api from "../../api";
import DestinationGroup from "./DestinationGroup";
import NewDestinationComponent from "./NewDestination";
import { defaultErrorHandler } from "../../api/utils";
import { useDestinations } from "../../state/hooks";

const drawerWidth = 440;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      position: "absolute",
      top: "75px",
      background: theme.palette.grey["200"],
      color: theme.palette.primary.dark,
      height: "100px",
      justifyContent: "center",
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      position: "absolute",
      top: "75px",
      background: theme.palette.grey["200"],
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
      height: "100px",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
      position: "relative",
      top: "20px",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  }),
);

const DestinationsList: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();

  const { incidentSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();
  const [
    { configuredMedia, knownMediaTypes, destinations },
    { fetchConfiguredMedia, loadDestinations, modifyDestination, createDestination, deleteDestination },
  ] = useDestinations();

  const [open, setOpen] = React.useState(false);

  const getConfiguredMedia = () => {
    api
      .getAllMedia()
      .then((res: Media[]) => {
        fetchConfiguredMedia(res);
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const fetchAllDestinations = () => {
    api
      .getAllDestinations()
      .then((res: Destination[]) => {
        loadDestinations(res);
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  // On mount
  useEffect(() => {
    getConfiguredMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On known media types update
  useEffect(() => {
    fetchAllDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownMediaTypes]);

  const createNewDestination = (newDestination: NewDestination): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      api
        .postDestination(newDestination)
        .then((destination: Destination) => {
          createDestination(destination);
          displayAlertSnackbar(
            `Created new destination: 
                ${
                  destination.label !== undefined && destination.label !== null
                    ? destination.label
                    : destination.suggested_label
                }`,
            "success",
          );
          resolve();
        })
        .catch(
          defaultErrorHandler((msg: string) => {
            displayAlertSnackbar(msg, "error");
            reject();
          }),
        );
    });
  };

  const updateExistingDestination = (newDestination: DestinationRequest): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      api
        .putDestination(newDestination)
        .then((destination: Destination) => {
          modifyDestination(destination);
          displayAlertSnackbar(`Updated destination: ${destination.suggested_label}`, "success");
          resolve();
        })
        .catch(
          defaultErrorHandler((msg: string) => {
            displayAlertSnackbar(msg, "error");
            reject();
          }),
        );
    });
  };

  const removeDestination = (destination: Destination, label: string) => {
    api
      .deleteDestination(destination.pk)
      .then(() => {
        deleteDestination(destination);
        displayAlertSnackbar(`Deleted destination: ${label}`, "warning");
      })
      .catch(
        defaultErrorHandler((msg: string) => {
          displayAlertSnackbar(msg, "error");
        }),
      );
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      {incidentSnackbar}
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <AddIcon fontSize={"large"} />
          </IconButton>
          <Typography variant="h4" noWrap>
            Destinations
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <NewDestinationComponent configuredMedia={configuredMedia} onCreate={createNewDestination} />
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />

        {[...destinations.keys()].map((mediaType: string) => {
          return (
            <DestinationGroup
              // todo fix this
              name={configuredMedia.filter((e) => e.slug === mediaType)[0].name}
              media={configuredMedia.filter((e) => e.slug === mediaType)[0]}
              destinations={destinations.get(mediaType)}
              onDestinationUpdate={updateExistingDestination}
              onDestinationDelete={removeDestination}
            />
          );
        })}
      </main>
    </div>
  );
};

export default DestinationsList;
