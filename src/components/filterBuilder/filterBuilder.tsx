import React, { useState, useEffect, SetStateAction } from "react";
import Select from "react-select";
import axios from "axios";
import "./FilterBuilder.css";
import moment from "moment";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Dialog from "@material-ui/core/Dialog";
import Table from "../react-table/Table";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

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
  const [showDialog, setShowDialog] = useState<[boolean, string]>([false, ""]);

  useEffect(() => {
    fetchProblemTypes();
    getAlerts();
  }, []);

  //fetches alerts and sets state
  const getAlerts = async () => {
    await axios({
      url: "http://localhost:8000/alerts/",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then((response: any) => {
      for (let item of response.data) {
        item.timestamp = moment(item.timestamp).format("YYYY.MM.DD  hh:mm:ss");
      }
      setPreviewAlerts(response.data);
    });
  };

  const postNewFilter = async () => {
    await axios({
      url: "http://localhost:8000/notificationprofiles/filters/",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      data: {
        name: name,
        filter_string: JSON.stringify(filter)
      }
    })
      .then(result => {
        if (result.status == 201) {
          setShowDialog([true, " Successfully saved filter "]);
        }
      })
      .catch(response => {
        setShowDialog([true, "oops, something went wrong :("]);
      });
  };

  const preview = async () => {
    console.log(filter);
    await axios({
      url: "http://localhost:8000/alerts/preview/",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      data: {
        problemTypes: filter.problemTypes,
        objectTypes: filter.objectTypes,
        networkSystems: filter.networkSystems
      }
    }).then(response => {
      for (let item of response.data) {
        item.timestamp = moment(item.timestamp).format("YYYY.MM.DD  hh:mm:ss");
      }
      setPreviewAlerts(response.data);
    });
  };

  const fetchProblemTypes = async () => {
    await axios({
      url: "http://localhost:8000/alerts/metadata/",
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
      alert("Please enter a name for this filter");
    } else {
      postNewFilter();
    }
  };
  const handleClose = () => {
    setShowDialog([false, ""]);
  };

  return (
    <div className="WrappingDiv">
      <Dialog open={showDialog[0]} onClose={handleClose}>
        <h1 className="dialogHeader">{showDialog[1]}</h1>
        <div className="dialogDiv">
          {showDialog[1] == " Successfully saved filter " ? (
            <CheckCircleIcon color={"primary"} />
          ) : (
            ""
          )}
        </div>
      </Dialog>
      <div className="filterBuilding-div">
        <div className="InputWrapperDiv">
          <h1 className={"filterHeader"}>Build custom filter </h1>
          <div className="filterSelect">
            <p>Name</p>
            <div className="NameFieldDiv">
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
          </div>
          <div className="filterSelect">
            <p>Select problem type</p>
            <Select
              className="selector"
              isMulti
              name="bois"
              options={problemTypes}
              onChange={value => handleChange(value, "problemTypes")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select objectTypes</p>
            <Select
              className="selector"
              isMulti
              name="boiss"
              options={objectTypes}
              onChange={value => handleChange(value, "objectTypes")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select netWorkSystemTypes</p>
            <Select
              className="selector"
              isMulti
              name="boisss"
              options={networkSystemTypes}
              onChange={value => handleChange(value, "networkSystemTypes")}
            ></Select>
          </div>
          <div className="filterSelect">
            <p>Select netWorkSystems</p>
            <Select
              className="selector"
              isMulti
              name="boissss"
              options={networkSystems}
              onChange={value => handleChange(value, "networkSystems")}
            ></Select>
          </div>
          <div className="ButtonDiv">
            <div className="create">
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
            <div className="preview">
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
      </div>
      <div className="previewList">
        <Table alerts={previewAlerts}></Table>
      </div>
    </div>
  );
};

export default FilterBuilder;
