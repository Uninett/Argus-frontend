import React from "react";
import Header from "../../components/header/Header";
import "../../components/alerttable/alerttable.css";
import FilterBuilder from "../../components/filterbuilder/FilterBuilder";
import { withRouter } from "react-router-dom";
type PropType = {
  history: any;
};

const Filters: React.FC<PropType> = (props) => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <h1 className={"filterHeader"}>Build custom filter </h1>
    </div>
  );
};

export default withRouter(Filters);
