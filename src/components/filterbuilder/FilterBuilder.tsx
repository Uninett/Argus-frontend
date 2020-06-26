import React, { useState } from "react";
import Select from "react-select";
import "./FilterBuilder.css";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";

import { FilterDefinition } from "../../api";
import { defaultFilter, Metadata } from "../../common/filters";

type FilterBuilderPropsType = {
  onFilterCreate: (name: string, filter: FilterDefinition) => void;
  onFilterPreview: (filter: FilterDefinition) => void;

  sourceIds: Metadata[];
  objectTypeIds: Metadata[];
  parentObjectIds: Metadata[];
  problemTypeIds: Metadata[];
};

const FilterBuilder: React.FC<FilterBuilderPropsType> = ({
  onFilterCreate,
  onFilterPreview,
  sourceIds,
  objectTypeIds,
  parentObjectIds,
  problemTypeIds,
}: FilterBuilderPropsType) => {
  // const LOADING_TEXT = "Loading...";
  // const NO_DATA_TEXT = "No data";
  // const NO_MATCHING_ALERTS_TEXT = "No matching alerts";

  const [filter, setFilter] = useState<FilterDefinition>(defaultFilter);
  const [name, setName] = useState<string>("");

  const handleChange = (value: any, property: string) => {
    setFilter({ ...filter, [property]: value ? value.map((metadata: Metadata) => metadata.value) : [] });
  };

  const handleNameChanged = (e: any) => {
    setName(e.target.value);
  };

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
            <p>Select problem types</p>
            <Select
              className="selector"
              isMulti
              name="bois"
              options={problemTypeIds}
              onChange={(value) => handleChange(value, "problemTypeIds")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select object types</p>
            <Select
              className="selector"
              isMulti
              name="boiss"
              options={objectTypeIds}
              onChange={(value) => handleChange(value, "objectTypeIds")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select parent objects</p>
            <Select
              className="selector"
              isMulti
              name="boisss"
              options={parentObjectIds}
              onChange={(value) => handleChange(value, "parentObjectIds")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select alert sources</p>
            <Select
              className="selector"
              isMulti
              name="boissss"
              options={sourceIds}
              onChange={(value) => handleChange(value, "sourceIds")}
            ></Select>
          </div>
          <div className="ButtonDiv">
            <div className="create">
              <Button onClick={handleCreate} variant="contained" color="primary" size="large" startIcon={<SaveIcon />}>
                create
              </Button>
            </div>
            <div className="preview">
              <Button onClick={() => onFilterPreview(filter)} variant="contained" color="primary" size="large">
                Preview Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBuilder;
