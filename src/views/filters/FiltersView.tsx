import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import MuiTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell, { TableCellProps } from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Header from "../../components/header/Header";

import "../../components/incidenttable/incidenttable.css";
import FilterBuilder from "../../components/filterbuilder/FilterBuilder";
import { withRouter } from "react-router-dom";
import api, { IncidentMetadata, Filter, FilterDefinition, SourceSystem, FilterSuccessResponse } from "../../api";

import { pkGetter, toMap } from "../../utils";

import IncidentsPreview from "../../components/incidentspreview/IncidentsPreview";

import { useAlertSnackbar, UseAlertSnackbarResultType } from "../../components/alertsnackbar";

interface FilterWithNames {
  pk: Filter["pk"];
  name: Filter["name"];

  sourceSystemIds: FilterDefinition["sourceSystemIds"];
  tags: FilterDefinition["tags"];
}

type FiltersTablePropsType = {
  filters: Filter[];
  knownSourcesMap: Map<SourceSystem["pk"], SourceSystem>;
  onFilterPreview: (filter: Filter) => void;
  onFilterDelete: (filter: Filter) => void;
};

const FiltersTable: React.FC<FiltersTablePropsType> = ({
  knownSourcesMap,
  filters,
  onFilterDelete,
  onFilterPreview,
}: FiltersTablePropsType) => {
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
                  (id: number): string => knownSourcesMap.get(id)?.name || `[pk: ${id}]`,
                ),
              ].join(",");

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
                  <ClickableCell>{filter.tags.join(",")}</ClickableCell>
                  <TableCell>
                    <Button onClick={() => onFilterPreview(filter)}>Preview</Button>
                    <Button onClick={() => onFilterDelete(filter)}>Delete</Button>
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

type FiltersViewPropType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
};

const FiltersView: React.FC<FiltersViewPropType> = () => {
  const [knownSources, setKnownSources] = useState<SourceSystem[]>([]);
  const [knownSourcesMap, setKnownSourcesMap] = useState<Map<SourceSystem["pk"], SourceSystem>>(
    new Map<SourceSystem["pk"], SourceSystem>(),
  );

  const { incidentSnackbar: filtersSnackbar, displayAlertSnackbar }: UseAlertSnackbarResultType = useAlertSnackbar();

  const [filters, setFilters] = useState<Filter[]>([]);

  const [previewFilter, setPreviewFilter] = useState<FilterDefinition | undefined>(undefined);
  const [previewFilterCounter, setPreviewFilterCounter] = useState<number>(0);

  const onFilterPreview = (filter: FilterDefinition) => {
    setPreviewFilter(filter);
    setPreviewFilterCounter((counter) => counter + 1);
  };

  const onFilterCreate = (name: string, filter: FilterDefinition) => {
    api
      .postFilter(name, filter)
      .then((newFilter: FilterSuccessResponse) => {
        setFilters((filters: Filter[]) => {
          return [...filters, { pk: newFilter.pk, name: newFilter.name, ...filter }];
        });
        displayAlertSnackbar(`Saved filter ${name}`, "success");
      })
      .catch((error) => {
        displayAlertSnackbar(`Unable to create filter: ${name}. Try using a different name`, "error");
        console.log(error);
      });
  };

  const onFilterDelete = (filter: Filter) => {
    api
      .deleteFilter(filter.pk)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setFilters((filters: Filter[]) => {
          return [...filters.filter((f: Filter) => filter.pk !== f.pk)];
        });
        displayAlertSnackbar("Deleted filter", "success");
      })
      .catch((error) => {
        displayAlertSnackbar(`Unable to delete filter: ${filter.name}!`, "error");
        console.log(error);
      });
  };

  useEffect(() => {
    const fetchProblemTypes = async () => {
      const incidentMetadata: IncidentMetadata = await api.getAllIncidentsMetadata();
      setKnownSources(incidentMetadata.sourceSystems);
      setKnownSourcesMap(toMap<SourceSystem["pk"], SourceSystem>(incidentMetadata.sourceSystems, pkGetter));

      const filters = await api.getAllFilters();
      setFilters(filters);
    };
    fetchProblemTypes();
  }, []);

  return (
    <div>
      <Header />
      {filtersSnackbar}
      <h1 className={"filterHeader"}>Your filters</h1>
      <FiltersTable
        knownSourcesMap={knownSourcesMap}
        filters={filters}
        onFilterDelete={onFilterDelete}
        onFilterPreview={onFilterPreview}
      />
      <h1 className={"filterHeader"}>Build custom filter </h1>
      <FilterBuilder onFilterPreview={onFilterPreview} onFilterCreate={onFilterCreate} knownSources={knownSources} />
      <h1 className={"filterHeader"}>Preview</h1>
      <div className="previewList">
        <IncidentsPreview key={previewFilterCounter} filter={previewFilter} />
      </div>
    </div>
  );
};

export default withRouter(FiltersView);
