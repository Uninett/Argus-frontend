import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

type Metadata = { label: string; value: string }[];
const defaultResponse = [{ label: "none", value: "none" }];

const FilterBuildingView: React.FC = () => {
  const [selectedProblemTypes, setSelectedProblemTypes] = useState([]);
  const [objectTypes, setobjectTypes] = useState<Metadata>(defaultResponse);
  const [problemTypes, setProblemTypes] = useState<Metadata>(defaultResponse);
  const [netWorkSystemTypes, setNetworkSystemTypes] = useState<Metadata>(
    defaultResponse
  );

  useEffect(() => {
    fetchProblemTypes();
  }, []);

  const fetchProblemTypes = async () => {
    let objectTypesResponse: Metadata = [];
    let networkTypesResponse: Metadata = [];
    let problemTypesResponse: Metadata = [];

    await axios({
      url: "http://localhost:8000/alerts/metaData",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(result => {
      result.data.objectTypes.map((obj: any) => {
        objectTypesResponse.push({
          label: obj.name,
          value: obj.name
        });
      });
      result.data.networkSystemTypes.map((networks: any) => {
        networkTypesResponse.push({
          label: networks.name,
          value: networks.name
        });
      });
      result.data.problemTypes.map((networks: any) => {
        problemTypesResponse.push({
          label: networks.name,
          value: networks.name
        });
      });
    });
    setProblemTypes(problemTypesResponse);
    setNetworkSystemTypes(networkTypesResponse);
    setobjectTypes(objectTypesResponse);
  };

  type OptionsType = [{ label: string; value: string }];
  const handleChange = (options: any) => {
    setSelectedProblemTypes(options);
  };

  return (
    <div>
      <p>Select alarm type</p>
      <Select
        isMulti
        key="1"
        name="bois"
        options={problemTypes}
        onChange={handleChange}
      ></Select>
      <p>Select objectTypes</p>
      <Select
        key="2"
        isMulti
        name="boiss"
        options={objectTypes}
        onChange={handleChange}
      ></Select>
      <p>Select netWorkSystemTypes</p>
      <Select
        key="3"
        isMulti
        name="boisss"
        options={netWorkSystemTypes}
        onChange={handleChange}
      ></Select>
    </div>
  );
};

export default FilterBuildingView;
