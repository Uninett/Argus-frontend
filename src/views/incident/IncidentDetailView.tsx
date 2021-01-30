import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import Typography from "@material-ui/core/Typography";

import api, { Incident } from "../../api";
import { useAlerts } from "../../components/alertsnackbar";

import IncidentDetails from "../../components/incident/IncidentDetails";

type IncidentDetailsViewPropsType = {};

export const IncidentDetailsView: React.FC<IncidentDetailsViewPropsType> = () => {
  const displayAlert = useAlerts();
  const { pk } = useParams<{ pk: string | undefined }>();

  const [incident, setIncident] = useState<Incident | undefined | null>(undefined);

  useEffect(() => {
    api
      .getIncident(Number.parseInt(pk || "0"))
      .then((incident: Incident) => {
        setIncident(incident);
      })
      .catch(() => {
        displayAlert(`Failed to get incident with pk=${pk}`, "error");
        setIncident(null);
      });
    // FIXME:
    // eslint-disable-next-line
  }, [pk]);

  if (incident === undefined) {
    return <Typography>Loading...</Typography>;
  } else if (incident === null) {
    return <Typography>No such incident</Typography>;
  }

  return (
    <>
      <IncidentDetails incident={incident} onIncidentChange={(incident: Incident) => setIncident(incident)} />
    </>
  );
};

export default IncidentDetailsView;
