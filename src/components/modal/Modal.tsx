import React, { useState } from "react";

/* MUI */
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";

import classNames from "classnames";

import Dialog, { DialogProps as MUIDialogProps } from "@material-ui/core/Dialog";
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    closeButton: {
      color: theme.palette.grey[500],
    },
    title: {
      userSelect: "none",
    },
    truncateText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    hidden: {
      visibility: "hidden",
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  truncateText: boolean;
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, truncateText, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <div className={truncateText ? classes.truncateText : undefined}>
        <Typography variant="h6" className={classes.title}>
          {children}
        </Typography>
      </div>
      <div className={classNames(classes.closeButton, onClose === undefined ? classes.hidden : undefined)}>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function Modal({
  title,
  truncateTitle = false,
  content,
  actions,
  open,
  onClose,
  dialogProps = {},
  className,
}: {
  title: string;
  truncateTitle?: boolean;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  dialogProps?: Partial<MUIDialogProps>;
}) {
  const [expandTitle, setExpandTitle] = useState<boolean>(truncateTitle !== true);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog className={className} onClose={handleClose} aria-labelledby="modal-title" open={open} {...dialogProps}>
      <DialogTitle id="modal-title" onClose={handleClose} truncateText={!expandTitle}>
        <div
          onClick={() => {
            // Toggle between showing truncated and full title on click
            if (truncateTitle === true) setExpandTitle((prev: boolean) => !prev);
          }}
        >
          {title}
        </div>
      </DialogTitle>
      {content && <DialogContent dividers>{content}</DialogContent>}
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
