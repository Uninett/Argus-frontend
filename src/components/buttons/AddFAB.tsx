import React from "react";
import Fab, { FabProps } from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

type AddFABPropsType = {
  onClick: () => void;
  disabled: FabProps["disabled"];
};

const AddFAB: React.FC<AddFABPropsType> = ({ onClick, disabled }: AddFABPropsType) => {
  return (
    <Fab color="primary" aria-label="add" size="medium" onClick={onClick} disabled={disabled}>
      <AddIcon />
    </Fab>
  );
};

export default AddFAB;
