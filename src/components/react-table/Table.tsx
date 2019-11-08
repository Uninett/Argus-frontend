import React from "react";
import ReactTable from "react-table";
import "./table.css";
import "react-table/react-table.css";

type AlertsProps = {
  alerts: any;
};

const Table: React.FC<AlertsProps> = props => {
  const columns: any = [
    {
      Header: "Timestamp",
      accessor: "timestamp"
    },
    {
      Header: "Alert ID",
      accessor: "alert_id"
    },
    { Header: "Source", accessor: "source.type.name" },
    { Header: "Description", accessor: "description" },
    { Header: "Details URL", accessor: "details_url" },
    { Header: "Object", accessor: "object.name" },
    { Header: "Parent object", accessor: "parent_object.name" },
    { Header: "Problem type", accessor: "problem_type.name" }
  ];

  return (
    <ReactTable
      columns={columns}
      loading={false}
      noDataText="Loading..."
      data={props.alerts}
      pageSize={props.alerts.length}
      showPaginationBottom={false}
    ></ReactTable>
  );
};

export default Table;
