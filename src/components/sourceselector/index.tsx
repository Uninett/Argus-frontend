import React, { useState } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export type SourceSelectorPropsType = {
  sources: string[];
  onSelectionChange: (source: string[]) => void;
  defaultSelected?: string[];
  disabled?: boolean;
};

export const SourceSelector: React.FC<SourceSelectorPropsType> = ({
  sources,
  onSelectionChange,
  defaultSelected,
  disabled,
}: SourceSelectorPropsType) => {
  const [selectValue, setSelectValue] = useState<string[]>(defaultSelected || []);

  return (
    <Autocomplete
      freeSolo
      multiple
      size="small"
      id="filter-select-tags"
      disableClearable
      options={sources}
      disabled={disabled}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" InputProps={{ ...params.InputProps, type: "search" }} />
      )}
      onChange={(e: unknown, changeValue, reason: string) => {
        switch (reason) {
          default:
            setSelectValue(changeValue);
            onSelectionChange(changeValue);
            break;
        }
      }}
      value={selectValue}
    />
  );
};

export default SourceSelector;
