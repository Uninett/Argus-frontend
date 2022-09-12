import React from "react";
import ReactTable, { SortingRule, Column } from "react-table";
import "react-table/react-table.css";

import { getPropertyByPath } from "../../utils";

// This is based on the following:
// https://github.com/tannerlinsley/react-table/issues/94
export function calculateTableCellWidth(cellString: string, cssMagicSpacing = 9): number {
  return cssMagicSpacing * cellString.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ColumnAccessorFunction<RowType> = (row: RowType) => string | any;
export type Accessor<RowType> = string | ColumnAccessorFunction<RowType>;
export function getMaxColumnWidth<RowType>(
  rows: RowType[],
  headerText: string,
  accessorValue: Accessor<RowType>,
  maxWidth = 600,
  cssMagicSpacing = 11,
): number {
  const accessorFunction =
    typeof accessorValue === "string"
      ? (row: RowType) => getPropertyByPath<RowType>(row, accessorValue)
      : accessorValue;
  const cellLength = (row: RowType): number => (`${accessorFunction(row)}` || "").length;
  const maxCellLength: number = rows.reduce((seen: number, row: RowType) => Math.max(seen, cellLength(row)), 0);
  return Math.min(maxWidth, cssMagicSpacing * Math.max(maxCellLength, headerText.length));
}

export type ConstrainedColumn<RowType> = {
  Header: string;
  accessor: Accessor<RowType>;
  maxWidth?: number;
  minWidth?: number;
};

export type ConstraintFunction<RowType> = (rows: RowType[], header: string, accessor: Accessor<RowType>) => number;
export function maxWidthColumn<RowType>(
  rows: RowType[],
  header: string,
  accessor: Accessor<RowType>,
  func: ConstraintFunction<RowType>,
): ConstrainedColumn<RowType> {
  return { Header: header, accessor, maxWidth: func(rows, header, accessor) };
}

type TablePropsType<RowType> = {
  data: RowType[];
  columns: Column[];
  noDataText?: string;
  pageSize?: number;
  loading?: boolean;
  sorted?: SortingRule[];
  onRowClick?: (data: RowType) => void;
};

type TableComponent<T> = React.FC<TablePropsType<T>>;

class Table<RowType> extends React.Component<TablePropsType<RowType>> {
  render() {
    const { data, columns, noDataText, pageSize, loading, sorted, onRowClick }: TablePropsType<RowType> = this.props;

    const tableProps = {
      ...(onRowClick
        ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getTrProps: (state: any, rowInfo: any) => {
              if (rowInfo && rowInfo.row) {
                return {
                  onClick: () => onRowClick(rowInfo.row._original as RowType),
                };
              }
            },
          }
        : {}),
    };

    return (
      <ReactTable
        defaultSorted={sorted || []}
        columns={columns}
        loading={loading}
        noDataText={noDataText || "No data"}
        data={data}
        pageSize={pageSize || data.length}
        showPaginationBottom={pageSize ? true : false}
        {...tableProps}
      />
    );
  }
}

export default Table;
