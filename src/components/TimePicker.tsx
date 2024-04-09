import React from "react";
import { KeyboardTimePicker, KeyboardTimePickerProps } from "@material-ui/pickers";

import { globalConfig } from "../config";

export type TimePickerPropsType = Exclude<KeyboardTimePickerProps, "ampm"> & {
  use24hours?: boolean;
};

export const TimePicker: React.FC<TimePickerPropsType> = ({
  use24hours = globalConfig.get().use24hTime,
  ...props
}: TimePickerPropsType) => {
  return <KeyboardTimePicker ampm={!use24hours} {...props} />;
};

export default TimePicker;
