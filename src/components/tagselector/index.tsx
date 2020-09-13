import React, { useEffect, useState } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

export type Tag = {
  key: string;
  value: string;
  original: string;
};

export type TagSelectorPropsType = {
  tags: Tag[];
  onSelectionChange: (tags: Tag[]) => void;
};

export const TagSelector: React.FC<TagSelectorPropsType> = ({ tags, onSelectionChange }: TagSelectorPropsType) => {
  const [value, setValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string[]>([]);

  // NOTE: proper handling of key-value pairs
  // is probably needed.
  const toTag = (str: string): Tag => {
    const [key, value] = str.split("=", 2);
    return { key, value, original: str };
  };

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
    onSelectionChange(selectValue.map(toTag));
  }, [selectValue, onSelectionChange]);

  return (
    <Autocomplete
      freeSolo
      multiple
      size="small"
      id="filter-select-tags"
      disableClearable
      options={tags.map((tag: Tag) => tag.key)}
      onChange={(e: unknown, changeValue, reason: string) => {
        console.log("onChange", reason, changeValue);
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
      onInputChange={(e: unknown, inputValue: string, reason: string) => {
        console.log("set value", reason, ":", inputValue);
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
