import React from "react";

// MUI
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { ButtonProps } from "@material-ui/core/Button";

import DeleteIcon from "@material-ui/icons/Delete";

// Components
import Modal from "../modal/Modal";
import { makeConfirmationButton } from "../../components/buttons/ConfirmationButton";

// Api
import type { Filter } from "../../api/types.d";

// Contexts/hooks
import { useFilters } from "../../api/actions";
import { useAlerts } from "../../components/alertsnackbar";

type FilterDialogPropsType = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

const DeleteButton = (props: ButtonProps) => {
  return (
    <IconButton onClick={props.onClick}>
      <DeleteIcon />
    </IconButton>
  );
};

const ConfirmDeleteButton = makeConfirmationButton({
  title: "Delete filter",
  question: "Are you sure you want to delete this filter?",
  ButtonComponent: DeleteButton,
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

export const FilterDialog = ({ open, onClose }: FilterDialogPropsType) => {
  const style = useStyles();
  const [filters, { deleteFilter }] = useFilters();
  const displayAlert = useAlerts();

  const onDelete = (filter: Filter) => {
    deleteFilter(filter.pk)
      .then(() => {
        displayAlert(`Deleted filter ${filter.name}`, "warning");
      })
      .catch((error) => {
        displayAlert(`${error.message}`, "error")
      });
  };

  return (
    <Modal
      title="Modify filters"
      open={open}
      onClose={onClose}
      content={
        <List className={style.root}>
          {filters.map((filter: Filter) => {
            return (
              <ListItem key={filter.name}>
                <ListItemText>{filter.name}</ListItemText>
                <ConfirmDeleteButton
                  onConfirm={() => {
                    onDelete(filter);
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      }
    />
  );
};

export default FilterDialog;
