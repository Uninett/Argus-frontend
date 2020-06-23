import React from "react";
import ReactTable, { SortingRule } from "react-table";
// import "./table.css";
import "react-table/react-table.css";

import { objectGetPropertyByPath } from "../../utils";

// This is based on the following:
// https://github.com/tannerlinsley/react-table/issues/94
export function calculateTableCellWidth(cellString: string, cssMagicSpacing: number = 9): number {
  return cssMagicSpacing * cellString.length;
}

export type Row = any;
export type ColumnAccessorFunction = (row: Row) => string;
export type Accessor = string | ColumnAccessorFunction;
export function getMaxColumnWidth(
  rows: Row[],
  headerText: string,
  accessorValue: Accessor,
  maxWidth: number = 600,
  cssMagicSpacing: number = 11,
): number {
  const accessorFunction =
    typeof accessorValue === "string" ? (row: Row) => objectGetPropertyByPath(row, accessorValue) : accessorValue;
  const cellLength = (row: Row): number => (`${accessorFunction(row)}` || "").length;
  const maxCellLength: number = rows.reduce((seen: number, row: Row) => Math.max(seen, cellLength(row)), 0);
  return Math.min(maxWidth, cssMagicSpacing * Math.max(maxCellLength, headerText.length));
}

export type ConstrainedColumn = {
  Header: string;
  accessor: Accessor;
  maxWidth?: number;
  minWidth?: number;
};

export type ConstraintFunction = (rows: Row[], header: string, accessor: Accessor) => number;
export function maxWidthColumn(
  rows: Row[],
  header: string,
  accessor: Accessor,
  func: ConstraintFunction,
): ConstrainedColumn {
  return { Header: header, accessor, maxWidth: func(rows, header, accessor) };
}

type TablePropsType = {
  data: any[];
  columns: any[];
  noDataText?: string;
  pageSize?: number;
  loading?: boolean;
  sorted?: SortingRule[];
};

const Table: React.FC<TablePropsType> = ({ data, columns, noDataText, pageSize, loading, sorted, ...props }) => {
  return (
    <ReactTable
      defaultSorted={sorted || []}
      columns={columns}
      loading={loading}
      noDataText={noDataText || "No data"}
      data={data}
      pageSize={pageSize || data.length}
      showPaginationBottom={pageSize ? true : false}
    />
  );
};

export default Table;
