import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

const FilterBuildingView: React.FC = () => {
  const [selectedProblemTypes, setSelectedProblemTypes] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);

  useEffect(() => {
    fetchProblemTypes();
  }, []);

  const fetchProblemTypes = async () => {
    const l: any = [];
    await axios({
      url: "http://localhost:8000/alerts/problem_types",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(result => {
      result.data.map((obj: any) => {
        l.push({
          label: obj.fields.name,
          value: obj.fields.name.replace(" ", "_")
        });
      });
    });
    setProblemTypes(l);
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
      <p>Select alarm source</p>
      <Select key="2" isMulti name="boiss" options={problemTypes}></Select>
    </div>
  );
};

export default FilterBuildingView;
