import React from "react";
import ReactTable from "react-table";
import "./table.css";
import "react-table/react-table.css";

import { AlertWithFormattedTimestamp } from "../../utils";

type AlertsProps = {
  alerts: AlertWithFormattedTimestamp[];
  noDataText: string;
};

//function formatDate(dateString: string):string {
//  2014-09-15T11:25:42.833000+02:00
//}

const SourceDetailUrl = (row: { value: string; original: { details_url: string } }) => {
  return (
    <a href={row.original.details_url} rel="noopener noreferrer" target="_blank">
      {" "}
      {row.value}{" "}
    </a>
  );
};

const Table: React.FC<AlertsProps> = (props) => {
  const columns: any = [
    {
      Header: "Timestamp",
      accessor: "timestamp",
      id: "timestamp_col",
    },
    { Header: "Problem type", accessor: "problem_type.name", id: "problem_type_col" },
    { Header: "Description", accessor: "description", id: "description_col" },
    { Header: "Object", accessor: "object.name", id: "object_col" },
    { Header: "Parent object", accessor: "parent_object.name", id: "parent_object_col" },
    {
      Header: "Source",
      accessor: (row: any, i: any) => String(row.source.name),
      id: "source_col",
      Cell: SourceDetailUrl,
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

export default Table;
