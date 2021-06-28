import React from "react";
import Chip from "@material-ui/core/Chip";
import type { SeverityLevelNumber, Timestamp } from "../../api/types.d";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { WHITE, YELLOW, ORANGE } from "../../colorscheme";
import { SeverityLevelNumberNameMap } from "../../api/consts";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    severityLevel1: {
      background: theme.palette.warning.main,
      color: WHITE,
    },
    severityLevel2: {
      background: ORANGE,
      color: WHITE,
    },
    severityLevel3: {
      background: theme.palette.secondary.main,
      color: WHITE,
    },
    severityLevel4: {
      background: YELLOW,
      color: WHITE,
    },
    severityLevel5: {
      background: theme.palette.success.main,
      color: WHITE,
    },
  }),
);

export type OpenItemPropsType = {
  open: boolean;
  small?: boolean;
};

export const OpenItem: React.FC<OpenItemPropsType> = ({ open, small }: OpenItemPropsType) => {
  const classes = useStyles();
  return (
    <Chip
      size={(small && "small") || undefined}
      variant="outlined"
      className={open ? classes.open : classes.closed}
      label={open ? "Open" : "Closed"}
    />
  );
};

type AckedItemPropsType = {
  acked: boolean;
  expiration?: Timestamp | null;
  small?: boolean;
};

export const AckedItem: React.FC<AckedItemPropsType> = ({ acked, expiration, small }: AckedItemPropsType) => {
  const classes = useStyles();

  const expiryDate = expiration && new Date(expiration);
  if (small) {
    return (
      <Chip
        size="small"
        className={acked ? classes.acknowledged : classes.unacknowledged}
        label={acked ? "Acked" : "Non-acked"}
      />
    );
  }
  return (
    <Chip
      className={acked ? classes.acknowledged : classes.unacknowledged}
      label={acked ? (expiryDate ? `Acknowledged until ${expiryDate}` : "Acknowledged") : "Unacknowledged"}
    />
  );
};

type TicketItemPropsType = {
  ticketUrl?: string;
  small?: boolean;
};

export const TicketItem: React.FC<TicketItemPropsType> = ({ ticketUrl, small }: TicketItemPropsType) => {
  const classes = useStyles();

  const chipProps =
    (ticketUrl && {
      component: "a",
      href: ticketUrl,
      clickable: true,
    }) ||
    {};

  if (small) {
    return (
      <Chip
        size="small"
        variant="outlined"
        className={ticketUrl ? classes.ticketed : classes.notticketed}
        label={ticketUrl ? `Ticket` : "No ticket"}
        {...chipProps}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      className={ticketUrl ? classes.ticketed : classes.notticketed}
      label={ticketUrl ? `Ticket ${ticketUrl}` : "No ticket"}
      {...chipProps}
    />
  );
};

export type LevelItemPropsType = {
  level: SeverityLevelNumber;
  small?: boolean;
};

export const LevelItem: React.FC<LevelItemPropsType> = ({ level, small }: LevelItemPropsType) => {
  const classes = useStyles();

  let itemStyle;
  if (level === 1) {
    itemStyle = classes.severityLevel1;
  } else if (level === 2) {
    itemStyle = classes.severityLevel2;
  } else if (level === 3) {
    itemStyle = classes.severityLevel3;
  } else if (level === 4) {
    itemStyle = classes.severityLevel4;
  } else {
    itemStyle = classes.severityLevel5;
  }

  return (
    <Chip
      size={(small && "small") || undefined}
      variant="outlined"
      className={itemStyle}
      label={`${level} - ${SeverityLevelNumberNameMap[level]}`}
    />
  );
};
