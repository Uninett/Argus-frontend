import React from "react";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

type ResponsiveDialogPropType = {
  handleDelete: () => void;
};
const ResponsiveDialog: React.FC<ResponsiveDialogPropType> = (props: ResponsiveDialogPropType) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAccept = () => {
    props.handleDelete();
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="secondary" size="small" onClick={handleClickOpen} startIcon={<DeleteIcon />}>
        Delete
      </Button>
      <Dialog fullScreen={fullScreen} open={open} onClose={handleClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{"Delete profile"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleAccept} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ResponsiveDialog;
