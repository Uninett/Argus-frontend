import React from "react";
import ReactTable from "react-table";
import "./alerttable.css";
import "react-table/react-table.css";

import { AlertWithFormattedTimestamp, objectGetPropertyByPath } from "../../utils";

// This is based on the following:
// https://github.com/tannerlinsley/react-table/issues/94
function calculateTableCellWidth(cellString: string, cssMagicSpacing: number = 9): number {
  return cssMagicSpacing * cellString.length;
}

type Row = any;
type ColumnAccessorFunction = (row: Row) => string;
type Accessor = string | ColumnAccessorFunction;
function getMaxColumnWidth(
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

type AlertsProps = {
  alerts: AlertWithFormattedTimestamp[];
  noDataText: string;
};

const SourceDetailUrl = (row: { value: string; original: { details_url: string } }) => {
  return (
    <a href={row.original.details_url} rel="noopener noreferrer" target="_blank">
      {" "}
      {row.value}{" "}
    </a>
  );
};

type ConstrainedColumn = {
  Header: string;
  accessor: Accessor;
  maxWidth?: number;
  minWidth?: number;
};

type ConstraintFunction = (rows: Row[], header: string, accessor: Accessor) => number;
function maxWidthColumn(rows: Row[], header: string, accessor: Accessor, func: ConstraintFunction): ConstrainedColumn {
  return { Header: header, accessor, maxWidth: func(rows, header, accessor) };
}

const AlertTable: React.FC<AlertsProps> = (props) => {
  const rows: Row[] = props.alerts;

  const timestampCellWidth: ConstraintFunction = (rows: Row[]) =>
    calculateTableCellWidth("2015-11-14T03:04:14.387000+01:00");

  const columns: any = [
    {
      id: "timestamp_col",
      ...maxWidthColumn(rows, "Timestamp", "timestamp", timestampCellWidth),
    },
    {
      id: "source_col",
      Cell: SourceDetailUrl,
      ...maxWidthColumn(rows, "Source", (row: Row) => String(row.source.name), getMaxColumnWidth),
    },
    {
      id: "problem_type_col",
      ...maxWidthColumn(rows, "Problem type", "problem_type.name", getMaxColumnWidth),
    },
    {
      id: "object_col",
      ...maxWidthColumn(rows, "Object", "object.name", getMaxColumnWidth),
    },
    {
      id: "parent_object_col",
      ...maxWidthColumn(rows, "Parent object", "parent_object.name", getMaxColumnWidth),
    },
    {
      id: "description_col",
      Header: "Description",
      accessor: "description",
    },
  ];

  return (
    <ReactTable
      defaultSorted={[
        {
          id: "formatted_timestamp",
          desc: true,
        },
      ]}
      columns={columns}
      loading={false}
      noDataText={props.noDataText}
      data={props.alerts}
      pageSize={props.alerts.length}
      showPaginationBottom={false}
    />
  );
};

export default AlertTable;
