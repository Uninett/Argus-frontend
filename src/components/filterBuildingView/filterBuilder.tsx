import React, { useState, useEffect, SetStateAction } from "react";
import Select from "react-select";
import axios from "axios";
import "./FilterBuilder.css";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Table from "../react-table/Table";

type Metadata = { label: string; value: string }[];
const defaultResponse = [{ label: "none", value: "none" }];

type Filter = {
  problemTypes: string[];
  objectTypes: string[];
  networkSystemTypes: string[];
  networkSystems: string[];
};

const defaultFilter = {
  problemTypes: [],
  objectTypes: [],
  networkSystemTypes: [],
  networkSystems: []
};

let objectTypesResponse: Metadata = [];
let networkTypesResponse: Metadata = [];
let networkSystemsResponse: Metadata = [];
let problemTypesResponse: Metadata = [];

let properties = [
  { propertyName: "objectTypes", list: objectTypesResponse },
  { propertyName: "networkSystems", list: networkSystemsResponse },
  { propertyName: "networkSystemTypes", list: networkTypesResponse },
  { propertyName: "problemTypes", list: problemTypesResponse }
];

const FilterBuilder: React.FC = () => {
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [name, setName] = useState("");
  const [objectTypes, setobjectTypes] = useState<Metadata>(defaultResponse);
  const [problemTypes, setProblemTypes] = useState<Metadata>(defaultResponse);
  const [networkSystemTypes, setNetworkSystemTypes] = useState<Metadata>(
    defaultResponse
  );
  const [networkSystems, setNetworkSystems] = useState<Metadata>(
    defaultResponse
  );
  const [previewAlerts, setPreviewAlerts] = useState<any>([]);

  useEffect(() => {
    fetchProblemTypes();
  }, []);

  const postNewFilter = async () => {
    await axios({
      url: "http://localhost:8000/notificationprofiles/filters",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      data: {
        name: name,
        filter: JSON.stringify(filter)
      }
    });
  };

  const preview = async () => {
    console.log(filter);
    await axios({
      url: "http://localhost:8000/alerts/preview",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      data: {
        problemTypes: filter.problemTypes,
        objectTypes: filter.objectTypes,
        networkSystems: filter.networkSystems
      }
    }).then(result => {
      setPreviewAlerts(result.data);
    });
  };

  const fetchProblemTypes = async () => {
    await axios({
      url: "http://localhost:8000/alerts/metaData",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(result => {
      properties.map(p => {
        result.data[p.propertyName].map((obj: any) => {
          p.list.push({
            label: obj.name,
            value: obj.name
          });
        });
      });
    });
    setProblemTypes(problemTypesResponse);
    setNetworkSystemTypes(networkTypesResponse);
    setobjectTypes(objectTypesResponse);
    setNetworkSystems(networkSystemsResponse);
  };

  const handleChange = (value: any, property: string) => {
    let newFilter: any = filter;
    newFilter[property] = value
      ? value.map((obj: any) => {
          return obj.value;
        })
      : [];
    setFilter(newFilter);
  };

  const handleName = (e: any) => {
    setName(e.target.value);
    console.log(name);
  };

  const handleCreate = () => {
    if (name == "") {
      alert("Please enter a name for this filter :3");
    } else {
      postNewFilter();
    }
  };

  return (
    <div className="WrappingDiv">
      <div className="filterBuilding-div">
        <div className="InputWrapperDiv">
          <h1 className={"filterHeader"}>Build custom filter </h1>

          <div className="NameFieldDiv">
            <p>Name</p>
            <TextField
              required
              id="standard-required"
              label="Required"
              defaultValue=""
              placeholder="name"
              onChange={handleName}
              margin="dense"
            />
          </div>

          <p>Select problem type</p>
          <Select
            isMulti
            name="bois"
            options={problemTypes}
            onChange={value => handleChange(value, "problemTypes")}
          ></Select>
          <p>Select objectTypes</p>
          <Select
            isMulti
            name="boiss"
            options={objectTypes}
            onChange={value => handleChange(value, "objectTypes")}
          ></Select>
          <p>Select netWorkSystemTypes</p>
          <Select
            isMulti
            name="boisss"
            options={networkSystemTypes}
            onChange={value => handleChange(value, "networkSystemTypes")}
          ></Select>
          <p>Select netWorkSystems</p>
          <Select
            isMulti
            name="boissss"
            options={networkSystems}
            onChange={value => handleChange(value, "networkSystems")}
          ></Select>
          <div className="ButtonDiv">
            <Button
              onClick={handleCreate}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
            >
              create
            </Button>
          </div>
          <div className="ButtonDiv">
            <Button
              onClick={preview}
              variant="contained"
              color="primary"
              size="large"
            >
              Preview Alerts
            </Button>
          </div>
        </div>
      </div>
      <Table alerts={previewAlerts}></Table>
    </div>
  );
};

export default FilterBuilder;
