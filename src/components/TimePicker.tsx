import React from "react";
import { KeyboardTimePicker, KeyboardTimePickerProps } from "@material-ui/pickers";

import { USE_24H_TIME } from "../config";

export type TimePickerPropsType = Exclude<KeyboardTimePickerProps, "ampm"> & {
  use24hours?: boolean;
};

export const TimePicker: React.FC<TimePickerPropsType> = ({
  use24hours = USE_24H_TIME,
  ...props
}: TimePickerPropsType) => {
  return <KeyboardTimePicker ampm={!use24hours} {...props} />;
};

export default TimePicker;
