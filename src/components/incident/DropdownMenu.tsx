import React, { ChangeEvent } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

type DropdownMenuPropsType<T> = {
  selected: string | number;
  onChange: (value: T) => void;
  children: React.ReactNode;
};

export function DropdownMenu<T>({ selected, onChange, children }: DropdownMenuPropsType<T>) {
  return (
    <FormControl size="small">
      <Select
        style={{ backgroundColor: "#FFFFFF" }}
        variant="outlined"
        id="demo-simple-select-outlined"
        value={selected}
        onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) => {
          const value = event.target.value as T;
          onChange(value);
        }}
      >
        {children}
      </Select>
    </FormControl>
  );
}
