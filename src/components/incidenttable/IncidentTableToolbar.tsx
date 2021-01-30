import React from "react";

// MUI
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import CheckSharpIcon from "@material-ui/icons/CheckSharp";
import LinkSharpIcon from "@material-ui/icons/LinkSharp";
import Typography from "@material-ui/core/Typography";

// Api
import { Incident } from "../../api";

// Components
import { useStyles } from "../incident/styles";

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    title: {
      flex: "1 1 100%",
    },
  }),
);

interface TableToolbarPropsType {
  selectedIncidents: Set<Incident["pk"]> | "SelectedAll";
  isLoading?: boolean;
}

/* TODO: Not implemented completely */
export const TableToolbar: React.FC<TableToolbarPropsType> = ({
  selectedIncidents,
  isLoading,
}: TableToolbarPropsType) => {
  const classes = useToolbarStyles();
  const rootClasses = useStyles();

  return (
    <Toolbar className={classes.root}>
      {selectedIncidents === "SelectedAll" || selectedIncidents.size > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {selectedIncidents === "SelectedAll" ? "All" : selectedIncidents.size} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {(isLoading && "Loading incidents...") || "Incidents"}
        </Typography>
      )}

      {selectedIncidents === "SelectedAll" || selectedIncidents.size > 0 ? (
        <>
          <Tooltip title="Link">
            <IconButton aria-label="link" className={rootClasses.safeButton}>
              <LinkSharpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Acknowledge" className={rootClasses.dangerousButton}>
            <IconButton aria-label="acknowledge">
              <CheckSharpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" className={rootClasses.dangerousButton}>
            <IconButton aria-label="close">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

export default TableToolbar;
