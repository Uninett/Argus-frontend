import React from "react";
import "./alerttable.css";
import "react-table/react-table.css";

// TODO: remove alertWithFormattedTimestamp
// use regular alert instead.
import { AlertWithFormattedTimestamp } from "../../utils";
import Table, { getMaxColumnWidth, maxWidthColumn, calculateTableCellWidth, ConstraintFunction } from "../table/Table";

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

const AlertTable: React.FC<AlertsProps> = ({ alerts }: AlertsProps) => {
  type A = AlertWithFormattedTimestamp;

  const timestampCellWidth: ConstraintFunction<A> = () => calculateTableCellWidth("2015-11-14T03:04:14.387000+01:00");

  const columns = [
    {
      id: "timestamp_col",
      ...maxWidthColumn<A>(alerts, "Timestamp", "timestamp", timestampCellWidth),
    },
    {
      id: "source_col",
      Cell: SourceDetailUrl,
      ...maxWidthColumn<A>(
        alerts,
        "Source",
        (alert: AlertWithFormattedTimestamp) => String(alert.source.name),
        getMaxColumnWidth,
      ),
    },
    {
      id: "problem_type_col",
      ...maxWidthColumn<A>(alerts, "Problem type", "problem_type.name", getMaxColumnWidth),
    },
    {
      id: "object_col",
      ...maxWidthColumn<A>(alerts, "Object", "object.name", getMaxColumnWidth),
    },
    {
      id: "parent_object_col",
      ...maxWidthColumn<A>(alerts, "Parent object", "parent_object.name", getMaxColumnWidth),
    },
    {
      id: "description_col",
      Header: "Description",
      accessor: "description",
    },
  ];

  return <Table data={alerts} columns={columns} sorted={[{ id: "timestamp_col", desc: true }]} />;
};

export default AlertTable;
