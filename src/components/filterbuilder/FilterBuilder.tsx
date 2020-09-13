import React, { useState, useCallback, useMemo } from "react";
import "./FilterBuilder.css";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";

import { FilterDefinition, SourceSystem } from "../../api";
import { toMap, removeUndefined } from "../../utils";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

type FilterBuilderPropsType = {
  onFilterCreate: (name: string, filter: FilterDefinition) => void;
  onFilterPreview: (filter: FilterDefinition) => void;

  knownSources: SourceSystem[];
};

const FilterBuilder: React.FC<FilterBuilderPropsType> = ({
  onFilterCreate,
  onFilterPreview,
  knownSources,
}: FilterBuilderPropsType) => {
  // TODO: copy pasted from IncidentsView. Should be refactored.
  const [sources, setSources] = useState<Set<string> | "AllSources">("AllSources");

  const [tags, setTags] = useState<Tag[]>([]);

  const [name, setName] = useState<string>("");

  // eslint-disable-next-line
  const handleNameChanged = (e: any) => {
    setName(e.target.value);
  };

  const [knownSourceNames, knownSourcesMap] = useMemo(() => {
    return [
      knownSources.map((source: SourceSystem) => source.name),
      toMap<SourceSystem["name"], SourceSystem>(knownSources, (elem: SourceSystem) => elem.name),
    ];
  }, [knownSources]);

  const filter = useMemo<FilterDefinition>((): FilterDefinition => {
    const sourcesArray = sources === "AllSources" ? [] : [...sources.values()];
    const validSources = sourcesArray.filter((sourceName: string) => knownSourcesMap.has(sourceName));

    const sourceSystemIds = removeUndefined(
      validSources.map((sourceName: string) => knownSourcesMap.get(sourceName)?.pk),
    );

    // TODO: Handle missing sources???

    return { tags: tags.map((tag: Tag) => `${tag.key}=${tag.value}`), sourceSystemIds };
  }, [sources, tags, knownSourcesMap]);

  const handleCreate = () => {
    if (name === "") {
      alert("Please enter a name for this filter");
    } else {
      onFilterCreate(name, filter);
    }
  };

  return (
    <div className="WrappingDiv">
      <div className="filterBuilding-div">
        <div className="InputWrapperDiv">
          <div className="filterSelect">
            <p>Name</p>
            <div className="NameFieldDiv">
              <TextField
                required
                id="standard-required"
                label="Required"
                defaultValue=""
                placeholder="name"
                onChange={handleNameChanged}
                margin="dense"
              />
            </div>
          </div>
          <div className="filterSelect">
            <p>Incident sources</p>
            <SourceSelector
              sources={knownSourceNames}
              onSelectionChange={(selection: string[]) => {
                setSources((selection.length !== 0 && new Set<string>(selection)) || "AllSources");
              }}
            />
          </div>
          <div className="filterSelect">
            <p>Tags</p>
            <TagSelector
              tags={tags}
              onSelectionChange={useCallback((selection: Tag[]) => {
                setTags(selection);
              }, [])}
            ></TagSelector>
          </div>
          <div className="ButtonDiv">
            <div className="create">
              <Button onClick={handleCreate} variant="contained" color="primary" size="large" startIcon={<SaveIcon />}>
                create
              </Button>
            </div>
            <div className="preview">
              <Button onClick={() => onFilterPreview(filter)} variant="contained" color="primary" size="large">
                Preview Incidents
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBuilder;
