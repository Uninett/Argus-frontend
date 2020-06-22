import React from "react";
import Header from "../../components/header/Header";
import "../../components/alerttable/alerttable.css";
import FilterBuilder from "../../components/filterbuilder/filterBuilder";
import { withRouter } from "react-router-dom";
type PropType = {
  history: any;
};

const FilterBuildingView: React.FC<PropType> = (props) => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Build custom filter </h1>
      <FilterBuilder />
    </div>
  );
};

export default withRouter(FilterBuildingView);
