import React, { useState, useCallback, useEffect, useContext } from "react";
import "./FilterBuilder.css";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Spinning from "../spinning";
import VisibilityIcon from "@material-ui/icons/Visibility";

import { Filter, FilterDefinition, SourceSystem } from "../../api";
import { removeUndefined } from "../../utils";

import TagSelector, { Tag } from "../../components/tagselector";
import SourceSelector from "../../components/sourceselector";

import { FiltersContext, FiltersContextType } from "../../components/filters/contexts";

type FilterBuilderPropsType = {
  exists: (name: string) => boolean;
  defaults?: Filter;
  onFilterCreate: (name: string, filter: FilterDefinition) => void;
  onFilterPreview: (filter: FilterDefinition) => void;
  onFilterUpdate: (pk: number, name: string, definition: FilterDefinition) => void;
};

const FilterBuilder: React.FC<FilterBuilderPropsType> = ({
  exists,
  defaults,
  onFilterCreate,
  onFilterPreview,
  onFilterUpdate,
}: FilterBuilderPropsType) => {
  const filtersContext = useContext<FiltersContextType>(FiltersContext);

  const [name, setName] = useState<string>("");
  const [sourceSystemIds, setSourceSystemIds] = useState<number[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (!defaults) return;
    setName(defaults.name);
    setSourceSystemIds(defaults.sourceSystemIds);
    setTags(
      defaults.tags.map((original: string) => {
        const [key, value] = original.split("=", 2);
        return { key, value, original };
      }),
    );
  }, [defaults]);

  // eslint-disable-next-line
  const handleNameChanged = (e: any) => {
    setName(e.target.value);
  };

  const filter = (): FilterDefinition => {
    return {
      sourceSystemIds,
      tags: tags.map((tag: Tag) => tag.original),
      // store those for later when backend is up for it.
      // details: {
      //   sources: sourceSystemIds.map((id: number) => knownSourcesMap[id]),
      //   show,
      //   showAcked,
      //   realtime: false,
      // },
    };
  };

  const handleCreate = () => {
    onFilterCreate(name, filter());
  };

  const handleSave = () => {
    if (defaults) onFilterUpdate(defaults.pk, name, filter());
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
                value={name}
                placeholder="name"
                onChange={handleNameChanged}
                margin="dense"
              />
            </div>
          </div>
          <div className="filterSelect">
            <p>Incident sources</p>
            <SourceSelector
              sources={filtersContext.sources.map((source: SourceSystem) => source.name)}
              onSelectionChange={(selection: string[]) => {
                // setSources((selection.length !== 0 && selection));
                setSourceSystemIds(
                  removeUndefined(selection.map((sourceName: string) => filtersContext.sourceFromName(sourceName)?.pk)),
                );
              }}
              defaultSelected={removeUndefined(
                sourceSystemIds.map((id: number) => filtersContext.sourceFromId(id)?.name),
              )}
            />
          </div>
          <div className="filterSelect">
            <p>Tags</p>
            <TagSelector
              allSelected
              tags={tags}
              onSelectionChange={useCallback((selection: Tag[]) => {
                setTags(selection);
              }, [])}
              defaultSelected={defaults?.tags}
            ></TagSelector>
          </div>
          <div className="ButtonDiv">
            <div className="create">
              {(exists(name) && (
                <Button
                  startIcon={filtersContext.savingFilter ? <Spinning shouldSpin /> : <SaveIcon />}
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={name === ""}
                >
                  Save
                </Button>
              )) || (
                <Button
                  onClick={handleCreate}
                  startIcon={filtersContext.savingFilter ? <Spinning shouldSpin /> : <SaveIcon />}
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={name === ""}
                >
                  Create
                </Button>
              )}
            </div>
            <div className="preview">
              <Button
                startIcon={filtersContext.loadingPreview === true ? <Spinning shouldSpin /> : <VisibilityIcon />}
                onClick={() => onFilterPreview(filter())}
                variant="contained"
                color="primary"
                size="large"
              >
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
