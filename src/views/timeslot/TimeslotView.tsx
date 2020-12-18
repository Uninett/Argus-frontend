import React from "react";
import { withRouter } from "react-router-dom";

import TimeslotList from "../../components/timeslotlist";

import { createStyles, makeStyles } from "@material-ui/core/styles";

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
  const style = useStyles();
  return (
    <div className={style.root}>
      <TimeslotList />
    </div>
  );
};

export default withRouter(TimeslotView);
