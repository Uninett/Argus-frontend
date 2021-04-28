import React from "react";

import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";

import classNames from "classnames";

// Api
import type { Timestamp } from "../../api/types.d";

import { formatTimestamp } from "../../utils";

type SignedMessagePropsType = {
  message: string;
  username: string;
  timestamp: Timestamp;

  content?: React.ReactNode;
  TextComponent?: React.ComponentType;
};

const SignedMessage: React.FC<SignedMessagePropsType> = ({
  message,
  username,
  timestamp,
  content,
  TextComponent,
}: SignedMessagePropsType) => {
  const ackDate = new Date(timestamp);
  const formattedAckDate = formatTimestamp(ackDate);

  const Component: React.ComponentType = TextComponent || ListItemText;

  return (
    <Grid container direction="column" spacing={2}>
      {content || <Component>{message}</Component>}

      <Grid container direction="row" spacing={2}>
        <Grid item sm>
          <Component>{username}</Component>
        </Grid>
        <Grid item container sm alignItems="flex-end" justify="space-evenly">
          <Component>{formattedAckDate}</Component>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SignedMessage;
