import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import yellow from "@material-ui/core/colors/yellow";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";

import { WHITE } from "../../colorscheme";

export const useStyles = makeStyles((theme: Theme) =>
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
    tableRowAcked: {
      borderLeftColor: yellow["300"],
    },
    tableRowClosed: {
      borderLeftColor: green["300"],
    },
    tableRowOpenUnacked: {
      borderLeftColor: red["300"],
    },
  }),
);
