import React from "react";
import Select, { Props as SelectProps } from "react-select";
import { removeUndefined } from "../../utils";

/*
 * The types from @types are not equal to the ones defined here:
 *  From https://react-select.com/props#prop-types
 */
type OptionType = { [key: string]: unknown };
type OptionsType = Array<OptionType>;

export interface SelectOptionsType<T> extends OptionType {
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
  return (option: unknown | unknown[] | SelectOptionsType<T>) => {
    if (Array.isArray(option)) {
      callback(option.map((option: SelectOptionsType<T>): T => option.value));
    } else if (option) {
      callback((option as SelectOptionsType<T>).value);
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

  const selectOptions: SelectOptionsType<T>[] = mapToSelectOption<T>([...options.values()]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      onChange={onSelectChangeHandler(onSelectChange || (() => undefined))}
      name="filters"
      label="Single select"
      defaultValue={defaultValue}
      filterOption={(option) => {
        return filterOption(option);
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={selectOptions as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values={enabledOptions as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isOptionDisabled={(option: any): boolean => (isOptionDisabled && isOptionDisabled(option.value as T)) || false}
    />
  );
}

Selector.defaultProps = {
  multiSelect: false,
};
export default Selector;
