import React from "react";

// MUI
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
import { Filter } from "../../api";

// Contexts
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

export const FilterDialog = ({ open, onClose }: FilterDialogPropsType) => {
  const [filters, { deleteFilter }] = useFilters();
  const displayAlert = useAlerts();

  const onDelete = (filter: Filter) => {
    deleteFilter(filter.pk).then(() => {
      displayAlert(`Deleted filter ${filter.name}`, "warning");
    });
  };

  return (
    <Modal
      title="Modify filters"
      open={open}
      onClose={onClose}
      content={
        <List>
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
