import React from "react";
import Modal from "../modal/Modal";
import { Media, NewDestination } from "../../api/types";
import NewDestinationComponent from "../destinations/NewDestination";

type AddDestinationDialogPropsType = {
  open: boolean;
  configuredMedia: Media[];
  onSave: (destination: NewDestination) => Promise<void>;
  onCancel: () => void;
};

const AddDestinationDialog = ({ open, onSave, configuredMedia, onCancel }: AddDestinationDialogPropsType) => {
  return (
    <Modal
      title="Add destination"
      content={<NewDestinationComponent configuredMedia={configuredMedia} onCreate={onSave} isModal={true} />}
      open={open}
      onClose={onCancel}
    />
  );
};

export default AddDestinationDialog;
