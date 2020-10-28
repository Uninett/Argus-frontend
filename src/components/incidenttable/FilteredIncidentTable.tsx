import React, { useEffect, useState, useMemo } from "react";
import IncidentTable from "./IncidentTable";

import "./FilteredIncidentTable.css";
import "../../components/incidenttable/incidenttable.css";

import { Tag } from "../../components/tagselector";
import TablePagination from "@material-ui/core/TablePagination";

import api, { IncidentsFilterOptions } from "../../api";
import { useApiPaginatedIncidents } from "../../api/hooks";

import { LOADING_TEXT, ERROR_TEXT, NO_DATA_TEXT } from "../../constants";

type PaginationCursor = {
  next: string | null;
  previous: string | null;
  current: string | null;
  pageSize: number;
};

type VirtCursor = {
  currentVirtualPage: number;
  lastVirtualPage: number;
  totalElements: number;
};

const DEFAULT_PAGINATION_CURSOR = {
  next: null,
  previous: null,
  current: null,
  pageSize: 10,
};

const DEFAULT_VIRT_CURSOR = {
  currentVirtualPage: 0,
  lastVirtualPage: 0,
  totalElements: 0,
};

export type IncidentsFilter = {
  tags: Tag[];
  sources: "AllSources" | string[];
  show: "open" | "closed" | "both";
  showAcked: boolean;
  realtime: boolean;
};

type FilteredIncidentsTablePropsType = {
  filter: IncidentsFilter;
  onLoad?: () => void;
};

const FilteredIncidentTable: React.FC<FilteredIncidentsTablePropsType> = ({
  filter,
  onLoad,
}: FilteredIncidentsTablePropsType) => {
  const { tags: tagsFilter, sources, show, showAcked, realtime } = filter;

  const [paginationCursor, setPaginationCursor] = useState<PaginationCursor>(DEFAULT_PAGINATION_CURSOR);
  const [virtCursor, setVirtCursor] = useState<VirtCursor>(DEFAULT_VIRT_CURSOR);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tags, setTags] = useState<Tag[]>([
    { key: "url", value: "https://test.test", original: "url=https://test.test" },
    { key: "host", value: "localhost", original: "host=localhost" },
  ]);

  // const [{ result: incidents, isLoading, isError }, setPromise] = useApiIncidents();
  const [{ result: paginatedResult, isLoading, isError }, setPromise] = useApiPaginatedIncidents();

  const [incidents, cursors] = [paginatedResult?.incidents || [], paginatedResult?.cursors];

  useEffect(() => {
    const showToOpenMap: Record<IncidentsFilter["show"], boolean | undefined> = {
      open: true,
      closed: false,
      both: undefined,
    };

    const filterOptions: IncidentsFilterOptions = {
      open: showToOpenMap[show],

      // The frontend is only conserned if acked incidents should be
      // displayed, not that ONLY acked incidents should be displayed.
      // Only filter on the acked property when
      acked: showAcked === true ? undefined : false,
      tags: tagsFilter.map((tag: Tag) => tag.original),
      sourceSystemNames: sources === "AllSources" ? undefined : sources,
    };

    setPromise(
      api
        .getPaginatedIncidentsFiltered(filterOptions, paginationCursor.current, paginationCursor.pageSize)
        .then((response) => {
          if (onLoad) onLoad();
          return response;
        }),
    );
  }, [setPromise, show, showAcked, tagsFilter, sources, paginationCursor, onLoad]);

  const noDataText = isLoading ? LOADING_TEXT : isError ? ERROR_TEXT : NO_DATA_TEXT;

  const totalElements = useMemo(() => {
    if (!cursors?.next && incidents) {
      const lastVirtualPage = virtCursor.currentVirtualPage;
      return paginationCursor.pageSize * lastVirtualPage + incidents.length;
    } else {
      return -1;
    }
  }, [paginationCursor, virtCursor, cursors, incidents]);

  const paginationComponent = useMemo(() => {
    // The TablePagination component will only display
    // the previous button if the page > 0, therefore we
    // just pass 1 when there is a previous page and 0
    // when there is not.
    //
    const page = virtCursor.currentVirtualPage;

    // We only know the count when we have encountered the end, so just keep it
    // at -1 until that happens.
    const count = totalElements;

    const handlePreviousPage = () => {
      const previous = cursors?.previous;
      if (previous) {
        setPaginationCursor((old) => {
          return { ...old, ...cursors, current: previous };
        });
        setVirtCursor((old) => {
          return { ...old, currentVirtualPage: old.currentVirtualPage - 1 };
        });
      }
    };

    const handleNextPage = () => {
      const next = cursors?.next;
      if (next) {
        setPaginationCursor((old) => {
          return { ...old, ...cursors, current: next };
        });
        setVirtCursor((old) => {
          return { ...old, currentVirtualPage: old.currentVirtualPage + 1 };
        });
      }
    };

    const handleChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
      const size = parseInt(event.target.value);
      setPaginationCursor((old) => {
        return { ...old, pageSize: size, current: null, previous: null, next: null };
      });
      setVirtCursor(DEFAULT_VIRT_CURSOR);
    };

    const disabled = isLoading || false;

    const nextButtonProps = { disabled: disabled || !cursors?.next || false };
    const prevButtonProps = { disabled: disabled || !cursors?.previous || false };
    const selectProps = { disabled };

    return (
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={count}
        rowsPerPage={paginationCursor.pageSize}
        page={page}
        onChangePage={(event: unknown, newPage: number) => {
          // Use the fact that the page number will either increase or
          // decrease.
          if (newPage > page) {
            handleNextPage();
          } else {
            handlePreviousPage();
          }
        }}
        onChangeRowsPerPage={handleChangePageSize}
        nextIconButtonProps={nextButtonProps}
        backIconButtonProps={prevButtonProps}
        SelectProps={selectProps}
      />
    );
  }, [paginationCursor, cursors, virtCursor, isLoading, totalElements]);

  // Reset pagination when any of the filter options are changed.
  useEffect(() => {
    setVirtCursor(DEFAULT_VIRT_CURSOR);
    setPaginationCursor(DEFAULT_PAGINATION_CURSOR);
  }, [showAcked, show, realtime, sources, tagsFilter]);

  return (
    <div className="table">
      <IncidentTable
        isLoading={isLoading}
        realtime={realtime}
        open={show === "open"}
        incidents={incidents}
        noDataText={noDataText}
        paginationComponent={paginationComponent}
      />
    </div>
  );
};

export default FilteredIncidentTable;
