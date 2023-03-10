import React from "react";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";

import { Helmet } from "react-helmet";
import {useBackground} from "../../hooks";
import DestinationsList from "../../components/destinations/DestinationsList";

const DestinationsView: React.FC = () => {
    useBackground("");
    return (
        <div>
            <Helmet>
                <title>Argus | Destinations</title>
            </Helmet>
            <Grid container direction="column" justify="space-evenly" alignItems="center">
                <DestinationsList/>
            </Grid>
        </div>
    );
};

export default withRouter(DestinationsView);
