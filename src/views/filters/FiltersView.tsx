import React, { useState, useEffect, useCallback, useContext } from "react";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import MuiTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell, { TableCellProps } from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/EditOutlined";

import Spinning from "../../components/spinning";

import { ENABLE_WEBSOCKETS_SUPPORT } from "../../config";

import Header from "../../components/header/Header";
import "../../components/incidenttable/incidenttable.css";
import FilterBuilder from "../../components/filterbuilder/FilterBuilder";
import { withRouter } from "react-router-dom";
import api, { IncidentMetadata, Filter, FilterDefinition, FilterSuccessResponse, SourceSystem } from "../../api";
import { toMapNum, toMapStr, pkGetter } from "../../utils";
import TagSelector, { Tag, originalToTag } from "../../components/tagselector";

import "../../components/incidenttable/incidenttable.css";

import { FiltersContext, FiltersContextType, DEFAULT_FILTERS_CONTEXT_VALUE } from "../../components/filters/contexts";
import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

import FilteredIncidentTable from "../../components/incidenttable/FilteredIncidentTable";

type FiltersTablePropsType = {
  filters: Filter[];
  onFilterPreview: (filter: Filter) => void;
  onFilterDelete: (filter: Filter) => void;
  onFilterEdit: (filter: Filter) => void;
};

const FiltersTable: React.FC<FiltersTablePropsType> = ({
  filters,
  onFilterDelete,
  onFilterPreview,
  onFilterEdit,
}: FiltersTablePropsType) => {
  const filtersContext = useContext<FiltersContextType>(FiltersContext);

  return (
    <Paper>
      <TableContainer component={Paper}>
        <MuiTable size="small" aria-label="incident table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Sources</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filters.map((filter: Filter) => {
              const ClickableCell = (props: TableCellProps) => (
                <TableCell onClick={(event) => () => console.log("row clicked", event)} {...props} />
              );

              const sourceNames = [
                ...(filter.sourceSystemIds as number[]).map(
                  (id: number): string => filtersContext.sourceFromId(id)?.name || `[pk: ${id}]`,
                ),
              ].join(",");

              const tags: Tag[] = [...filter.tags.map(originalToTag)];

              return (
                <TableRow
                  hover
                  key={filter.pk}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <ClickableCell>{filter.name}</ClickableCell>
                  <ClickableCell>{sourceNames}</ClickableCell>
                  <TagSelector disabled tags={tags} onSelectionChange={() => undefined} defaultSelected={filter.tags} />

                  <TableCell>
                    <Button
                      startIcon={
                        filtersContext.loadingPreview === filter.pk ? <Spinning shouldSpin /> : <VisibilityIcon />
                      }
                      onClick={() => onFilterPreview(filter)}
                    >
                      Preview
                    </Button>
                    <Button
                      startIcon={filtersContext.deletingFilter === filter.pk ? <Spinning shouldSpin /> : <DeleteIcon />}
                      onClick={() => onFilterDelete(filter)}
                    >
                      Delete
                    </Button>
                    <Button startIcon={<EditIcon />} onClick={() => onFilterEdit(filter)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Paper>
  );
};

type FiltersViewPropsType = {};

const FiltersView: React.FC<FiltersViewPropsType> = ({}: FiltersViewPropsType) => {
  const { incidentSnackbar: filtersSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  // const [sourcesIdsFilter, setSourceIdsFilter] = useState<number[]>([]);
  // const [tagsFilter, setTagsFilter] = useState<Tag[]>([]);

  const [previewFilter, setPreviewFilter] = useState<{
    tags: Tag[];
    sources: string[] | "AllSources";
    sourcesById: number[];
    show: "open" | "closed" | "both";
    showAcked: boolean;
    realtime: boolean;
  }>({
    tags: [],
    sources: "AllSources",
    sourcesById: [],
    show: "open",
    showAcked: true,
    realtime: ENABLE_WEBSOCKETS_SUPPORT,
  });

  // The editing filter is the one modified/updated by the Filter Builder
  // and is the one that we can save/create.
  const [editingFilter, setEditingFilter] = useState<Filter | undefined>(undefined);

  // Filters is the list of existing filters.
  // It is loaded once from the backend on refresh, but then
  // only modified locally by using results from the backend etc.
  const [filters, setFilters] = useState<Filter[]>([]);

  const filterExists = (name: string) => {
    return (filters.find((f) => f.name === name) && true) || false;
  };

  const [filtersContext, setFiltersContext] = useState<FiltersContextType>({
    ...DEFAULT_FILTERS_CONTEXT_VALUE,
    filterExists,
  });

  useEffect(() => {
    api
      .getAllIncidentsMetadata()
      .then((incidentMetadata: IncidentMetadata) => {
        const byId = toMapNum<SourceSystem>(incidentMetadata.sourceSystems, pkGetter);
        const byName = toMapStr<SourceSystem>(incidentMetadata.sourceSystems, (source: SourceSystem) => source.name);

        api
          .getAllFilters()
          .then((filters) => {
            setFilters(filters);

            setFiltersContext((prev: FiltersContextType) => {
              return {
                ...prev,
                sourceFromId: (id: number) => byId[id],
                sourceFromName: (name: string) => byName[name],
                sources: incidentMetadata.sourceSystems,
              };
            });
          })
          .catch((error) => {
            displayAlertSnackbar(`Failed to get filters: ${error}`, "error");
          });
      })
      .catch((error) => {
        displayAlertSnackbar(`Failed to get incidents metadata: ${error}`, "error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterCreate = (name: string, filter: FilterDefinition) => {
    setFiltersContext((prev: FiltersContextType) => {
      return { ...prev, savingFilter: true };
    });
    api
      .postFilter(name, filter)
      .then((response: FilterSuccessResponse) => {
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, savingFilter: false };
        });

        setFilters((prev: Filter[]) => {
          return [...prev, { ...filter, name: response.name, pk: response.pk }];
        });
        displayAlertSnackbar(`Created filter ${name}`, "success");
      })
      .catch((error) => {
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, savingFilter: false };
        });
        displayAlertSnackbar(`Failed to create filter ${name}: ${error}`, "error");
      });
  };

  const handleFilterUpdate = (name: string, definition: FilterDefinition) => {
    const filter = filters.find((f) => f.name === name);
    if (!filter) {
      displayAlertSnackbar(`Unknown filter: ${name}, can't update`, "error");
      return;
    }
    api
      .putFilter(filter.pk, name, definition)
      .then(() => {
        displayAlertSnackbar(`Saved filter: ${name}`, "success");
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, savingFilter: false };
        });

        setFilters((prev: Filter[]) => {
          const index = prev.findIndex((f: Filter) => f.pk === filter.pk);
          const updated = [...prev];
          updated[index] = { ...updated[index], ...definition };
          return updated;
        });
        displayAlertSnackbar(`Saved filter ${name}`, "success");
      })
      .catch((error) => {
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, savingFilter: false };
        });
        displayAlertSnackbar(`Failed to save filter ${name}: ${error}`, "error");
      });
  };

  const handleFilterDelete = (filter: Filter) => {
    setFiltersContext((prev: FiltersContextType) => {
      return { ...prev, deletingFilter: filter.pk };
    });
    api
      .deleteFilter(filter.pk)
      .then(() => {
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, deletingFilter: undefined };
        });
        setFilters((prev: Filter[]) => {
          const n = [...prev];
          const index = n.findIndex((f: Filter) => f.pk === filter.pk);
          n.splice(index, 1);
          return n;
        });
        displayAlertSnackbar(`Deleted filter ${filter.name}`, "warning");
      })
      .catch((error) => {
        setFiltersContext((prev: FiltersContextType) => {
          return { ...prev, deletingFilter: undefined };
        });
        displayAlertSnackbar(`Failed to delete filter ${filter.name}: ${error}`, "error");
      });
  };

  const handleFilterPreview = (filter: FilterDefinition | Filter) => {
    setFiltersContext((prev: FiltersContextType) => {
      if ("pk" in filter && "name" in filter) {
        // set the pk so that we can display a loading spinner in the table.
        displayAlertSnackbar(`Previewing filter ${(filter as Filter).name}`, "success");
        return { ...prev, loadingPreview: (filter as Filter).pk };
      }
      displayAlertSnackbar("Previewing filter from builder", "success");
      return { ...prev, loadingPreview: true };
    });
    setPreviewFilter((prev) => ({
      ...prev,
      tags: filter.tags.map(originalToTag),
      sourcesById: filter.sourceSystemIds,
    }));
  };

  const filterBuilder = (editingFilter && (
    <FilterBuilder
      exists={filterExists}
      defaults={editingFilter}
      onFilterCreate={handleFilterCreate}
      onFilterUpdate={handleFilterUpdate}
      onFilterPreview={handleFilterPreview}
    />
  )) || (
    <FilterBuilder
      exists={filterExists}
      onFilterCreate={handleFilterCreate}
      onFilterUpdate={handleFilterUpdate}
      onFilterPreview={handleFilterPreview}
    />
  );

  const handleIncidentsLoaded = () => {
    // TODO: FIXME
    setFiltersContext((prev: FiltersContextType) => {
      return { ...prev, loadingPreview: false };
    });
  };

  return (
    <>
      {filtersSnackbar}
      <div>
        <header>
          <Header />
        </header>
        <FiltersContext.Provider value={filtersContext}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your incident filters
              </Typography>

              <FiltersTable
                filters={filters}
                onFilterPreview={handleFilterPreview}
                onFilterEdit={(filter: Filter) => {
                  setEditingFilter(filter);
                }}
                onFilterDelete={handleFilterDelete}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create and preview filters
              </Typography>
              {filterBuilder}
              <Typography color="textSecondary" gutterBottom>
                Incidents matching filter
              </Typography>
              <FilteredIncidentTable filter={previewFilter} onLoad={useCallback(() => handleIncidentsLoaded(), [])} />
            </CardContent>
          </Card>
        </FiltersContext.Provider>
      </div>
    </>
  );
};

export default withRouter(FiltersView);
