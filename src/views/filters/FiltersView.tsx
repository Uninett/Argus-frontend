import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import "../../components/incidenttable/incidenttable.css";
import FilterBuilder from "../../components/filterbuilder/FilterBuilder";
import { withRouter } from "react-router-dom";
import api, {
  SourceSystem,
  IncidentMetadata,
  Filter,
  FilterDefinition,
  FilterPK,
} from "../../api";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import Table, { Accessor } from "../../components/table/Table";
import IncidentsPreview from "../../components/incidentspreview/IncidentsPreview";

import { Metadata, defaultResponse, mapToMetadata } from "../../common/filters";

interface Keyable {
  pk: string | number;
}

type Dict<T> = {
  [key: string]: T;
};

function reducer<T extends Keyable>(elements: T[], initial: Dict<T> = {}): Dict<T> {
  return elements.reduce((acc: Dict<T>, curr: T) => ({ [curr.pk]: curr, ...acc }), initial);
}

type Id = string;
type Name = string;
type IdNameTuple = [Id, Name];
interface FilterWithNames {
  pk: FilterPK;
  name: Name;

  sourceSystems: IdNameTuple[];
}

type FilterDefinitionDict = {
  sourceSystems: Dict<SourceSystem>;
};

enum IdNameField {
  ID = 0,
  NAME = 1,
}

type StringProperty<T> = {
  [key: string]: T[];
};

// TODO: fix this when new filter model is introduced
// eslint-disable-next-line
function fromIdNameTuple(property: string, field: IdNameField) {
  // eslint-disable-next-line
  return (row: any) => (property in row ? row[property].map((elem: any) => elem[field]) : undefined);
}

function filterWithNamesToDefinition(filterWithNames: FilterWithNames): FilterDefinition {
  const idGetter = (element: IdNameTuple) => element[IdNameField.ID];

  return {
    sourceSystemIds: filterWithNames.sourceSystems.map(idGetter),
  };
}

function filterToFilterWithNames(definition: FilterDefinitionDict, filter: Filter): FilterWithNames {
  const filterDefinition: FilterDefinition = JSON.parse(filter.filter_string);
  const sourceSystems = filterDefinition.sourceSystemIds.map(
    (id: string): IdNameTuple => [id, definition.sourceSystems[id].name],
  );
  return { pk: filter.pk, name: filter.name, sourceSystems };
}

type FilterTablePropType = {
  filters: Dict<FilterWithNames>;
  onFilterDelete: (filter: FilterWithNames) => void;
  onFilterPreview: (filter: FilterWithNames) => void;
};

const FilterTable: React.FC<FilterTablePropType> = ({ filters, onFilterDelete, onFilterPreview }) => {
  const withCell = (
    id: string,
    header: string,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessor: Accessor<any>,
    cellCreator?: (filter: FilterWithNames) => React.ReactNode,
  ) => {
    if (cellCreator) {
      const cell = ({ original }: { original: FilterWithNames }) => cellCreator(original);
      return { id, Header: header, accessor, Cell: cell };
    }
    return { id, Header: header, accessor };
  };

  // TODO: make type-safe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const namesFrom = (property: string): Accessor<any> => (row: any) => {
    return fromIdNameTuple(property, IdNameField.NAME)(row).join(", ");
  };

  const columns = [
    withCell("name_col", "Filter name", "name"),
    withCell("sources_col", "Sources", namesFrom("sourceSystems")),
    withCell("actions_col", "Actions", "name_col", (filter: FilterWithNames) => {
      return (
        <>
          <Button onClick={() => onFilterDelete(filter)} variant="contained" color="primary" size="small">
            Delete
          </Button>
          <Button onClick={() => onFilterPreview(filter)} variant="contained" color="primary" size="small">
            Preview
          </Button>
        </>
      );
    }),
  ];

  return <Table data={Object.values(filters)} columns={columns} sorted={[{ id: "name_col", desc: false }]} />;
};

type FiltersViewPropType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
};

const sourceSystemsResponse: Metadata[] = [];

const FiltersView: React.FC<FiltersViewPropType> = () => {
  const [sourceSystemIds, setSourceSystemIds] = useState<Metadata[]>(defaultResponse);

  const [sourceSystems, setSourceSystems] = useState<Dict<SourceSystem>>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<[boolean, string]>([false, ""]);

  const [filters, setFilters] = useState<Dict<FilterWithNames>>({});

  const [previewFilter, setPreviewFilter] = useState<FilterDefinition | undefined>(undefined);
  const [previewFilterCounter, setPreviewFilterCounter] = useState<number>(0);

  // TODO: delete filters
  function deleteFilter(filter: FilterWithNames) {
    api
      .deleteFilter(filter.pk)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [filter.pk]: _, ...others } = filters;
        setFilters(others);
        setShowDialog([true, "Successfully deleted filter"]);
      })
      .catch((error) => {
        console.log(error);
        setShowDialog([true, `Unable to delete filter: ${filter.name}!`]);
      });
  }

  function createFilter(name: string, filter: FilterDefinition) {
    api
      .postFilter(name, JSON.stringify(filter))
      .then((filter: Filter) => {
        setFilters({
          [filter.pk]: filterToFilterWithNames({ sourceSystems }, filter),
          ...filters,
        });
        setShowDialog([true, "Successfully saved filter"]);
      })
      .catch((error) => {
        setShowDialog([true, `Unable to create filter: ${name}. Try using a different name`]);
        console.log(error);
      });
  }

  function onPreviewFilterByDefinition(filter?: FilterDefinition) {
    setPreviewFilterCounter((counter) => counter + 1);
    setPreviewFilter(filter);
  }

  function onPreviewFilter(filter?: FilterWithNames) {
    onPreviewFilterByDefinition((filter && filterWithNamesToDefinition(filter)) || undefined);
  }

  const handleClose = () => {
    setShowDialog([false, ""]);
  };

  useEffect(() => {
    const fetchProblemTypes = async () => {
      const incidentMetadata: IncidentMetadata = await api.getAllIncidentsMetadata();

      const sourceSystems = reducer<SourceSystem>(incidentMetadata.sourceSystems);

      setSourceSystems(sourceSystems);

      incidentMetadata.sourceSystems.map(mapToMetadata).forEach((m: Metadata) => sourceSystemsResponse.push(m));

      setSourceSystemIds(sourceSystemsResponse);

      const filters = await api.getAllFilters();
      setFilters(
        reducer<FilterWithNames>(
          filters.map((filter: Filter) => {
            return filterToFilterWithNames({ sourceSystems }, filter);
          }),
        ),
      );
      setLoading(false);
    };
    fetchProblemTypes();
  }, []);

  const filterTableOrLoading = (loading && <h1>Loading...</h1>) || (
    <div>
      <Dialog open={showDialog[0]} onClose={handleClose}>
        <h1 className="dialogHeader">{showDialog[1]}</h1>
        <div className="dialogDiv">
          {showDialog[1] === " Successfully saved filter " ? <CheckCircleIcon color={"primary"} /> : ""}
        </div>
      </Dialog>
      <FilterTable filters={filters} onFilterDelete={deleteFilter} onFilterPreview={onPreviewFilter} />
    </div>
  );

  return (
    <div>
      <header>
        {" "}
        <Header />{" "}
      </header>
      <h1 className={"filterHeader"}>Your filters</h1>
      {filterTableOrLoading}
      <h1 className={"filterHeader"}>Build custom filter </h1>
      <FilterBuilder
        onFilterPreview={(filter: FilterDefinition) => onPreviewFilterByDefinition(filter)}
        sourceSystemIds={sourceSystemIds}
        onFilterCreate={createFilter}
      />
      <h1 className={"filterHeader"}>Preview</h1>
      <div className="previewList">
        <IncidentsPreview key={previewFilterCounter} filter={previewFilter} />
      </div>
    </div>
  );
};

export default withRouter(FiltersView);
