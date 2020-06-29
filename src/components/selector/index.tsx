import React, { useState, useEffect } from "react";
import Select, { OptionsType, OptionTypeBase, Props as SelectProps, ValueType } from "react-select";

import { removeUndefined } from "../../utils";

export interface SelectOptionsType<T> extends OptionTypeBase {
  label: string;
  value: T;
}

export function toSelectOption<T extends { name: string }>(elem: T): SelectOptionsType<T> {
  return { label: elem.name, value: elem };
}

export function mapToSelectOption<T extends { name: string }>(elems: T[]): SelectOptionsType<T>[] {
  return elems.map(toSelectOption);
}

export function onSelectChangeHandler<T>(callback: (target: T[] | T | undefined) => void): SelectProps["onChange"] {
  // TODO: fix
  return (option: any) => {
    if (Array.isArray(option)) {
      callback(option.map((option: SelectOptionsType<T>) => option.value));
    } else if (option) {
      callback(option.value);
    } else {
      callback(undefined);
    }
  };
}

export type SelectorPropsType<T, K> = {
  enabledOptionsKeys: Set<K>;
  options: Map<K, T>;
  multiSelect: boolean;
  onSelectChange?: (target: T[] | T | undefined) => void;

  isOptionDisabled?: (option: T) => boolean;
};

export function Selector<T extends { name: string; pk: K }, K extends number | string>({
  enabledOptionsKeys,
  options,
  multiSelect,
  onSelectChange,
  isOptionDisabled,
}: SelectorPropsType<T, K>) {
  const enabledOptions = mapToSelectOption<T>(
    removeUndefined([...enabledOptionsKeys.values()].map((key: K) => options.get(key))),
  );

  const selectOptions = mapToSelectOption<T>([...options.values()]);

  const defaultValue = multiSelect ? (enabledOptions as any) : (enabledOptions[0] as any);

  function filterOption({ data }: { data: SelectOptionsType<T> }): boolean {
    return !(data.value.pk in enabledOptionsKeys);
  }

  return (
    <Select
      isMulti={multiSelect}
      /*
       * getOptionValue is required because of the select
       * component doesn't set the "key" prop correctly:
       * https://github.com/JedWatson/react-select/issues/3306
       */
      getOptionValue={(option) => option.label}
      onChange={onSelectChangeHandler(onSelectChange || (() => {}))}
      name="filters"
      label="Single select"
      defaultValue={defaultValue}
      filterOption={(option) => {
        return filterOption(option);
      }}
      options={selectOptions as any}
      values={enabledOptions as any}
      isOptionDisabled={(option: any): boolean => (isOptionDisabled && isOptionDisabled(option.value as T)) || false}
    />
  );
}

Selector.defaultProps = {
  multiSelect: false,
};
export default Selector;
