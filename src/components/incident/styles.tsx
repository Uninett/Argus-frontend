import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import grey from "@material-ui/core/colors/grey";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import yellow from "@material-ui/core/colors/yellow";

import { WHITE } from "../../colorscheme";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(1, 2, 0),
    },
    closeIcon: {
      marginRight: theme.spacing(2),
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    grid: {
      "display": "flex",
      "flex-wrap": "wrap",
      "align-items": "stretch",
      "align-content": "stretch",
      "justify-content": "space-evenly",
      "flex-grow": 0,
    },
    dangerousButton: {
      background: theme.palette.warning.main,
      color: "#FFFFFF !important",
        '&:hover': {
            backgroundColor: `${theme.palette.warning.main} !important`,
            opacity: 0.7
        },
    },
    safeButton: {
      background: theme.palette.primary.main,
      color: "#FFFFFF !important",
        '&:hover': {
            backgroundColor: `${theme.palette.primary.main} !important`,
            opacity: 0.7
        },
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
    tableRow: {
      borderLeftWidth: "10px",
      borderLeftStyle: "solid",
      borderLeftColor: "transparent",
    },
    tableRowHeadRealtime: {
      borderBottomWidth: "5px",
      borderBottomStyle: "solid",
      borderBottomColor: blue["300"],
    },
    tableRowHeadRealtimeLoading: {
      borderBottomWidth: "5px",
      borderBottomStyle: "solid",
      borderBottomColor: red["300"],
    },
    tableRowHeadNormal: {},
    tableRowLoading: {
      borderLeftColor: grey["300"],
    },
    tableRowAcked: {
      borderLeftColor: yellow["300"],
    },
    tableRowClosed: {
      borderLeftColor: green["300"],
    },
    tableRowOpenUnacked: {
      borderLeftColor: red["300"],
    },
    feedRoot: {
      display: "flex",
      flexDirection: "column",
      flexBasis: "33.333333%",
    },
    feedItems: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "start",
      overflow: "hidden",
      flexGrow: 1,
      flexBasis: "0px",
    },
    feedList: {
      overflowY: "scroll",
      overflowX: "auto",
    },
    detailsRoot: {
      display: "flex",
      flexDirection: "column",
      flexBasis: "33.333333%",
    },
  }),
);
