import React, { ReactChild, ReactChildren } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

type SpinningPropsType = {
  shouldSpin: boolean;
  children?: ReactChild | ReactChildren;
};

const Spinning: React.SFC<SpinningPropsType> = (props: SpinningPropsType) => {
  if (props.shouldSpin) {
    return <CircularProgress color="secondary" size="1rem" />;
  }
  return <>{props.children}</>;
};

export default Spinning;
