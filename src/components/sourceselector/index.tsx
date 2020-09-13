import React from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export type SourceSelectorPropsType = {
  sources: string[];
  onSelectionChange: (source: string[]) => void;
};

export const SourceSelector: React.FC<SourceSelectorPropsType> = ({
  sources,
  onSelectionChange,
}: SourceSelectorPropsType) => {
  return (
    <Autocomplete
      freeSolo
      multiple
      size="small"
      id="filter-select-tags"
      disableClearable
      options={sources}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" InputProps={{ ...params.InputProps, type: "search" }} />
      )}
      onChange={(e: unknown, changeValue, reason: string) => {
        console.log("onChange", reason, changeValue);
        switch (reason) {
          default:
            onSelectionChange(changeValue);
            break;
        }
      }}
    />
  );
};

export default SourceSelector;
