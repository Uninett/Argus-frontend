import React, { useCallback, useEffect, useState, useMemo } from "react";

// MUI
import TablePagination from "@material-ui/core/TablePagination";

// Config
import { DEFAULT_AUTO_REFRESH_INTERVAL } from "../../config";

// Api
import type { Filter, Incident, CursorPaginationResponse, AutoUpdateMethod } from "../../api/types.d";
import api from "../../api";

// Utils
import { formatTimestamp, saveToLocalStorage, fromLocalStorageOrDefault, addHoursToDate } from "../../utils";

import { PAGINATION_CURSOR_PAGE_SIZE } from "../../localstorageconsts";

// Contexts/Hooks
import { useIncidentsContext } from "../../components/incidentsprovider";
import { useSelectedFilter } from "../../components/filterprovider";
import { useApiState, useTimeframe } from "../../state/hooks";

// Providers
import FilteredIncidentsProvider, { matchesFilter, matchesTimeframe } from "../../components/filteredincidentprovider";

// Components
import { MinimalIncidentTable } from "./IncidentTable";
import { useAlerts } from "../alertsnackbar";
import Skeleton from "@material-ui/lab/Skeleton";

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

const FilteredIncidentTable = () => {
  // Keep track of last time a refresh of data was done in order to update on interval.
  const [lastRefresh, setLastRefresh] = useState<{ time: Date; filter: Omit<Filter, "pk" | "name"> } | undefined>(
    undefined,
  );

  const displayAlert = useAlerts();

  // Get the incidents and seleceted filter from context
  const [{ incidents }, { storeAllIncidents, loadAllIncidents }] = useIncidentsContext();
  const [{ incidentsFilter }] = useSelectedFilter();

  const [{ autoUpdateMethod }] = useApiState();
  const [timeframe] = useTimeframe();

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
  const [isCursorLoading, setIsCursorLoading] = useState<boolean>(false);

  const refresh = useCallback(() => {
    const filter: Omit<Filter, "pk" | "name"> = {
      filter: incidentsFilter.filter
    };

    // Find start of timeframe by removing hours from current datetime
    let timeframeStart;
    if (timeframe.timeframeInHours !== 0) timeframeStart = addHoursToDate(new Date(), -timeframe.timeframeInHours);
    
    api
      .getPaginatedIncidentsFiltered(filter, paginationCursor.current, paginationCursor.pageSize, timeframeStart)
      .then((response: CursorPaginationResponse<Incident>) => {
        storeAllIncidents(response.results);
        loadAllIncidents(response.results);
        const { previous, next } = response;
        setCursors({ previous, next });
        setLastRefresh({ time: new Date(), filter: incidentsFilter });
        setIsLoading(false);
        setIsCursorLoading(false);
        return response;
      })
      .catch((error: Error) => {
        setIsLoading(false);
        setIsCursorLoading(false);
        displayAlert(error.message, "error");
      });
  }, [incidentsFilter, timeframe, paginationCursor, storeAllIncidents, loadAllIncidents, displayAlert]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Save current pagination size to local storage.
    saveToLocalStorage<PaginationCursor["pageSize"]>(PAGINATION_CURSOR_PAGE_SIZE, paginationCursor.pageSize);
  }, [paginationCursor]);

  // Activate table loading on any incident filter update
  useEffect(() => {
    setIsLoading(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentsFilter.filter]);

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
        setIsLoading(true)
        setIsCursorLoading(true)
        setVirtCursor((old) => {
          return { ...old, currentVirtualPage: old.currentVirtualPage - 1 };
        });
        setPaginationCursor((old) => {
          return { ...old, ...cursors, current: previous };
        });
      }
    };

    const handleNextPage = () => {
      const next = cursors?.next;
      if (next) {
        setIsLoading(true)
        setIsCursorLoading(true)
        setVirtCursor((old) => {
          return { ...old, currentVirtualPage: old.currentVirtualPage + 1 };
        });
        setPaginationCursor((old) => {
          return { ...old, ...cursors, current: next };
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

    const disabled = isLoading || isCursorLoading;

    const nextButtonProps = { disabled: disabled || !cursors?.next };
    const prevButtonProps = { disabled: disabled || !cursors?.previous };
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
        labelDisplayedRows={({ from, to, count }) => {
          if (isCursorLoading) {
            return <Skeleton animation={"wave"} width={150} height={30} />
          } else {
            return `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        }}
      />
    );
  }, [paginationCursor, cursors, virtCursor, isLoading, totalElements, isCursorLoading]);

  // Reset pagination when any of the filter options are changed.
  // Also set the filter matcher
  useEffect(() => {
    setVirtCursor(DEFAULT_VIRT_CURSOR);
    setPaginationCursor((old: PaginationCursor) => ({ ...DEFAULT_PAGINATION_CURSOR, pageSize: old.pageSize }));
  }, [incidentsFilter]);

  const filterMatcher = useMemo(() => {
    const {
      filter,
    } = incidentsFilter;
    const incidentMatchesFilter = (incident: Incident): boolean => {
      return (
        matchesFilter(incident,
          {
            filter,
          }) &&
        matchesTimeframe(incident, timeframe.timeframeInHours)
      );
    };
    return incidentMatchesFilter;
  }, [incidentsFilter, timeframe]);

  useEffect(() => {
    // refresh incidents from backend at a set interval if we
    // are utilizing the interval auto-update strategy
    if (autoUpdateMethod === "interval") {
      const interval = setInterval(() => {
        refresh();
      }, 1000 * DEFAULT_AUTO_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [refresh, autoUpdateMethod]);

  const autoUpdateTextOpts: Record<AutoUpdateMethod, string> = {
    never: "not updating automatically",
    realtime: "updating in real time",
    interval: `updating every ${DEFAULT_AUTO_REFRESH_INTERVAL}`,
  };

  const autoUpdateText = autoUpdateTextOpts[autoUpdateMethod as AutoUpdateMethod];

  return (
    <div>
      <FilteredIncidentsProvider filterMatcher={filterMatcher}>
        <MinimalIncidentTable
          isRealtime={false}
          isLoading={isLoading}
          isLoadingRealtime={false}
          paginationComponent={paginationComponent}
          currentPage={paginationComponent.props.page}
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
