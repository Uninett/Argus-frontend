import React, { useCallback, useEffect, useState, useMemo } from "react";

// MUI
import TablePagination from "@material-ui/core/TablePagination";

// Config
import { DEFAULT_AUTO_REFRESH_INTERVAL } from "../../config";

// Api
import type { Incident, IncidentsFilterOptions, CursorPaginationResponse } from "../../api/types.d";
import api from "../../api";

// Utils
import { formatTimestamp, saveToLocalStorage, fromLocalStorageOrDefault } from "../../utils";

import { PAGINATION_CURSOR_PAGE_SIZE } from "../../localstorageconsts";

// Contexts/Hooks
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useSelectedFilter } from "../../components/filterprovider";

// Providers
import FilteredIncidentsProvider, { matchesFilter } from "../../components/filteredincidentprovider";

// Components
import { MinimalIncidentTable } from "./IncidentTable";
import { Tag } from "../../components/tagselector";

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

export type AutoUpdate = "never" | "realtime" | "interval";

export type IncidentsFilter = {
  tags: Tag[];
  sources: "AllSources" | string[] | undefined;
  sourcesById: number[] | undefined;
  show: "open" | "closed" | "both";
  showAcked: boolean;
  autoUpdate: AutoUpdate;
};

type FilteredIncidentsTablePropsType = {};

const FilteredIncidentTable = () => {
  // Keep track of last time a refresh of data was done in order to update on interval.
  const [lastRefresh, setLastRefresh] = useState<{ time: Date; filter: IncidentsFilter } | undefined>(undefined);

  // Get the incidents and seleceted filter from context
  const [{ incidents }, { loadAllIncidents }] = useIncidentsContext();
  const [{ filter }] = useSelectedFilter();

  // Keep track of the pagination cursor
  const [paginationCursor, setPaginationCursor] = useState<PaginationCursor>(
    // Load page size from local storage if possible
    {
      ...DEFAULT_PAGINATION_CURSOR,
      pageSize: fromLocalStorageOrDefault<number>(PAGINATION_CURSOR_PAGE_SIZE, 25, (pageSize: number) => pageSize > 0),
    },
  );
  // We need a virtual cursor in order to retain information
  // about the maxiumum observed amount of pages (we don't get this information from the backend)
  // and the total amount of elements (which we know when we reach the end)
  const [virtCursor, setVirtCursor] = useState<VirtCursor>(DEFAULT_VIRT_CURSOR);

  // These cursors are the one returned by the last api call.
  const [cursors, setCursors] = useState<{ previous: string | null; next: string | null }>({
    previous: null,
    next: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    const showToOpenMap: Record<IncidentsFilter["show"], boolean | undefined> = {
      open: true,
      closed: false,
      both: undefined,
    };

    const filterOptions: IncidentsFilterOptions = {
      open: showToOpenMap[filter.show as "open" | "closed" | "both"],

      // The frontend is only conserned if acked incidents should be
      // displayed, not that ONLY acked incidents should be displayed.
      // Only filter on the acked property when
      acked: filter.showAcked === true ? undefined : false,
      tags: filter.tags.map((tag: Tag) => tag.original),
      // sourceSystemNames: sources === "AllSources" ? undefined : sources,
      sourceSystemIds: filter.sourcesById,
    };

    setIsLoading(true);
    api
      .getPaginatedIncidentsFiltered(filterOptions, paginationCursor.current, paginationCursor.pageSize)
      .then((response: CursorPaginationResponse<Incident>) => {
        loadAllIncidents(response.results);
        const { previous, next } = response;
        setCursors({ previous, next });
        setLastRefresh({ time: new Date(), filter });
        setIsLoading(false);
        return response;
      });
  }, [filter, paginationCursor, loadAllIncidents]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Save current pagination size to local storage.
    saveToLocalStorage<PaginationCursor["pageSize"]>(PAGINATION_CURSOR_PAGE_SIZE, paginationCursor.pageSize);
  }, [paginationCursor]);

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
  // Also set the filter matcher
  useEffect(() => {
    setVirtCursor(DEFAULT_VIRT_CURSOR);
    setPaginationCursor((old: PaginationCursor) => ({ ...DEFAULT_PAGINATION_CURSOR, pageSize: old.pageSize }));
  }, [filter]);

  const filterMatcher = useMemo(() => {
    const { showAcked, show, tags, sourcesById } = filter;
    const incidentMatchesFilter = (incident: Incident): boolean => {
      return matchesFilter(incident, { showAcked, show, tags, sourcesById });
    };
    return incidentMatchesFilter;
  }, [filter]);

  useEffect(() => {
    // refresh incidents from backend at a set interval if we
    // are utilizing the interval auto-update strategy
    if (filter.autoUpdate === "interval") {
      const interval = setInterval(() => {
        refresh();
      }, 1000 * DEFAULT_AUTO_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [refresh, filter]);

  const autoUpdateTextOpts: Record<AutoUpdate, string> = {
    never: "not updating automatically",
    realtime: "updating in real time",
    interval: `updating every ${DEFAULT_AUTO_REFRESH_INTERVAL}`,
  };

  const autoUpdateText = autoUpdateTextOpts[filter.autoUpdate];

  return (
    <div>
      <FilteredIncidentsProvider filterMatcher={filterMatcher}>
        <MinimalIncidentTable
          isRealtime={false}
          isLoading={isLoading}
          isLoadingRealtime={false}
          paginationComponent={paginationComponent}
        />
      </FilteredIncidentsProvider>
      <p>
        Last refreshed {lastRefresh === undefined ? "never" : formatTimestamp(lastRefresh.time, { withSeconds: true })}{" "}
        {autoUpdateText}
      </p>
    </div>
  );
};

export default FilteredIncidentTable;
