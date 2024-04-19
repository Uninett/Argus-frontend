import React from "react";
import Grid from "@material-ui/core/Grid";

type CenterContainerPropsType = { children: React.Props<{}>["children"] };

const CenterContainer: React.FC<CenterContainerPropsType> = ({ children }: CenterContainerPropsType) => {
  return (
    <Grid container alignItems="center" justify="space-evenly" direction="row">
      {children}
    </Grid>
  );
};

export default CenterContainer;
