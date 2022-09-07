import React, { useState, useMemo } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export type Tag = {
  key: string;
  value: string;
  original: string;
};

// NOTE: proper handling of key-value pairs
// is probably needed.
export const originalToTag = (str: string): Tag => {
  const [key, value] = str.split("=", 2);
  return { key, value, original: str };
};

export type TagSelectorPropsType = {
  tags: string[];
  onSelectionChange: (tags: string[]) => void;
  selected?: string[];
  allSelected?: boolean;
  disabled?: boolean;
  className?: string;
};

export const TagSelector: React.FC<TagSelectorPropsType> = ({
  tags,
  onSelectionChange,
  selected,
  disabled,
  className,
}: TagSelectorPropsType) => {
  const { keys } = useMemo(() => {
    const keys: { [key: string]: boolean } = {};
    const values: { [key: string]: boolean } = {};

    tags.forEach((original: string) => {
      const typed = originalToTag(original);
      keys[typed.key] = true;
      values[typed.value] = true;
    });

    return { keys: Object.keys(keys), values: Object.values(values) };
  }, [tags]);

  const [value, setValue] = useState<string>("");

  const handleSelectNew = (newValue: string[]) => {
    const oldSet = new Set<string>(selected);

    let updatedInputValue = false;
    newValue
      .filter((s: string) => !oldSet.has(s))
      .forEach((s: string) => {
        if (!updatedInputValue) {
          updatedInputValue = true;
          setValue(s);
        }
      });

    if (updatedInputValue) onSelectionChange(newValue);
  };

  return (
    <Autocomplete
      freeSolo
      multiple
      size="small"
      id="filter-select-tags"
      disableClearable
      options={keys}
      disabled={disabled}
      onChange={(e: unknown, changeValue, reason: string) => {
        if (reason === "select-option") {
          handleSelectNew(changeValue);
        } else {
          onSelectionChange(changeValue);
        }
      }}
      inputValue={value}
      onInputChange={(e: unknown, inputValue: string) => {
        setValue(inputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          className={className}
          label={selected ? undefined : "Filter tags"}
          InputProps={{ ...params.InputProps, type: "search" }}
          helperText={(!disabled && "Press enter to add new tag") || undefined}
          placeholder={(!disabled && "key=value") || undefined}
        />
      )}
      value={selected}
    />
  );
};

export default TagSelector;
