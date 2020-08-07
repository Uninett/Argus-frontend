import React from "react";
import Chip from "@material-ui/core/Chip";
import { useStyles } from "./styles";
import { Timestamp } from "../../api";

export type ActiveItemPropsType = {
  active: boolean;
  small?: boolean;
};

export const ActiveItem: React.FC<ActiveItemPropsType> = ({ active, small }: ActiveItemPropsType) => {
  const classes = useStyles();
  return (
    <Chip
      size={(small && "small") || undefined}
      variant="outlined"
      className={active ? classes.open : classes.closed}
      label={active ? "Open" : "Closed"}
    />
  );
};

type AckedItemPropsType = {
  acked: boolean;
  expiresAt?: Timestamp | null;
  small?: boolean;
};

export const AckedItem: React.FC<AckedItemPropsType> = ({ acked, expiresAt, small }: AckedItemPropsType) => {
  const classes = useStyles();

  const expiryDate = expiresAt && new Date(expiresAt);
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
