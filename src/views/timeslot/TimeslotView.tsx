import React from "react";
import { withRouter } from "react-router-dom";

import TimeslotList from "../../components/timeslotlist";

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";
import {useBackground} from "../../hooks";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  }),
);

const TimeslotView: React.FC = () => {
  useBackground("");
  const style = useStyles();
  return (
    <div className={style.root}>
      <Helmet>
        <title>Argus | Timeslots</title>
      </Helmet>
      <TimeslotList />
    </div>
  );
};

export default withRouter(TimeslotView);
