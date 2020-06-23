import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./FilterBuilder.css";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Dialog from "@material-ui/core/Dialog";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import api, { Alert, AlertMetadata, Filter, FilterDefinition } from "../../api";
import { defaultFilter, Metadata } from "../../common/filters";

type FilterBuilderProps = {
  onFilterCreate: (name: string, filter: FilterDefinition) => void;
  onFilterPreview: (filter: FilterDefinition) => void;

  sourceIds: Metadata[];
  objectTypeIds: Metadata[];
  parentObjectIds: Metadata[];
  problemTypeIds: Metadata[];
};

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  onFilterCreate,
  onFilterPreview,
  sourceIds,
  objectTypeIds,
  parentObjectIds,
  problemTypeIds,
  ...props
}) => {
  // const LOADING_TEXT = "Loading...";
  // const NO_DATA_TEXT = "No data";
  // const NO_MATCHING_ALERTS_TEXT = "No matching alerts";

  const [filter, setFilter] = useState<FilterDefinition>(defaultFilter);
  const [name, setName] = useState<string>("");

  // const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);
  const [showDialog, setShowDialog] = useState<[boolean, string]>([false, ""]);

  // const getAlerts = (filter?: FilterDefinition) => {
  //   const promise = (filter && api.postFilterPreview(filter)) || api.getAllAlerts();
  //   promise.then((alerts: Alert[]) => {
  //     const formattedAlerts = alerts.map(alertWithFormattedTimestamp);
  //     setNoDataText(alerts.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
  //     setPreviewAlerts(formattedAlerts);
  //   });
  //   console.log("geAlerts()")
  // };

  const handleChange = (value: any, property: string) => {
    const newFilter: any = filter;
    newFilter[property] = value
      ? value.map((obj: any) => {
          return obj.value;
        })
      : [];
    setFilter(newFilter);
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
