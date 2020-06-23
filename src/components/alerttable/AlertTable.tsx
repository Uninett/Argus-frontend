import React from "react";
// import ReactTable from "react-table";
import "./alerttable.css";
import "react-table/react-table.css";

import { AlertWithFormattedTimestamp } from "../../utils";
import Table, {
  getMaxColumnWidth,
  maxWidthColumn,
  calculateTableCellWidth,
  ConstraintFunction,
  Row,
} from "../table/Table";

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

  return <Table data={rows} columns={columns} sorted={[{ id: "timestamp_col", desc: true }]} />;
};

export default AlertTable;
