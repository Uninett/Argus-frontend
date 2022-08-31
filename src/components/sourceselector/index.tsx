import React, { useState, useEffect } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export type SourceSelectorPropsType = {
  sources: string[];
  onSelectionChange: (source: string[]) => void;
  defaultSelected: string[];
  disabled?: boolean;
};

export const SourceSelector: React.FC<SourceSelectorPropsType> = ({
  sources,
  onSelectionChange,
  defaultSelected,
  disabled,
}: SourceSelectorPropsType) => {
  const [selectValue, setSelectValue] = useState<string[]>([]);

  useEffect(() => {
    setSelectValue(defaultSelected);
  }, [defaultSelected]);

  return (
    <Autocomplete
      data-testid="autocomplete"
      freeSolo
      multiple
      size="small"
      id="filter-select-source"
      disableClearable
      options={sources}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          InputProps={{ ...params.InputProps, type: "search" }}
          helperText={(!disabled && "Press enter to add new source") || undefined}
          placeholder={(!disabled && "Source name") || undefined}
        />
      )}
      onChange={(e: unknown, changeValue, reason: string) => {
        setSelectValue(changeValue);
        onSelectionChange(changeValue);
      }}
      value={selectValue}
    />
  );
};

export default SourceSelector;
