import React from "react";

// MUI
import Typography from "@material-ui/core/Typography";
import grey from "@material-ui/core/colors/grey";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import classNames from "classnames";

// Api
import type { Timestamp } from "../../api/types.d";

// Utils
import { formatTimestamp } from "../../utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      padding: "10px",
    },
    content: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
    },
    footer: {
      padding: theme.spacing(2),

      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      backgroundColor: grey["200"],

      // Divider
      borderTopStyle: "solid",
      borderTopColor: "gray",
      borderTopWidth: "2px",
    },
  }),
);

type SignedMessagePropsType = {
  message: string;
  username: string;
  timestamp: Timestamp;

  className?: string;
  content?: React.ReactNode;
  TextComponent?: React.ComponentType;
};

const SignedMessage: React.FC<SignedMessagePropsType> = ({
  message,
  username,
  timestamp,
  className,
  content,
  TextComponent,
}: SignedMessagePropsType) => {
  const classes = useStyles();
  const ackDate = new Date(timestamp);
  const formattedAckDate = formatTimestamp(ackDate);

  const Component: React.ComponentType = TextComponent || Typography;

  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.content} style={{ visibility: message ? "visible" : "hidden" }}>
        {content}
      </div>

      <div className={classes.footer}>
        <Component>{username}</Component>
        <Component>{formattedAckDate}</Component>
      </div>
    </div>
  );
};

export default SignedMessage;
