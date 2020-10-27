import React, { useEffect, useState } from "react";

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
  tags: Tag[];
  onSelectionChange: (tags: Tag[]) => void;
  defaultSelected?: string[];
  allSelected?: boolean;
  disabled?: boolean;
};

export const TagSelector: React.FC<TagSelectorPropsType> = ({
  tags,
  onSelectionChange,
  defaultSelected,
  disabled,
}: TagSelectorPropsType) => {
  const [value, setValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string[]>([]);

  useEffect(() => {
    if (!defaultSelected) return;
    setSelectValue(defaultSelected);
  }, [defaultSelected]);

  const handleSelectNew = (newValue: string[]) => {
    setSelectValue((oldValue: string[]) => {
      const oldSet = new Set<string>(oldValue);

      let updatedInputValue = false;
      newValue
        .filter((s: string) => !oldSet.has(s))
        .map((s: string) => {
          if (!updatedInputValue) {
            updatedInputValue = true;
            setValue(s);
          }
        });

      return updatedInputValue ? oldValue : newValue;
    });
  };

  useEffect(() => {
    onSelectionChange(selectValue.map(originalToTag));
  }, [selectValue, onSelectionChange]);

  return (
    <Autocomplete
      freeSolo
      multiple
      size="small"
      id="filter-select-tags"
      disableClearable
      options={tags.map((tag: Tag) => tag.key)}
      disabled={disabled}
      onChange={(e: unknown, changeValue, reason: string) => {
        switch (reason) {
          case "select-option":
            handleSelectNew(changeValue);
            break;

          default:
            setSelectValue(changeValue);
            break;
        }
      }}
      inputValue={value}
      onInputChange={(e: unknown, inputValue: string /* , reason: string */) => {
        setValue(inputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={selectValue ? undefined : "Filter tags"}
          InputProps={{ ...params.InputProps, type: "search" }}
        />
      )}
      value={selectValue}
    />
  );
};

export default TagSelector;
