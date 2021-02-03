import React, { useContext, useMemo } from "react";

// Api
import { Incident, IncidentTag } from "../api";

// Utils
import { groupBy } from "../utils";

// Contexts/Hooks
import { IncidentsStateType, IncidentsContext, createIncidentsIndex } from "../components/incidentsprovider";

// Components
import { Tag } from "../components/tagselector";

// for all different tags "keys", THERE HAS TO BE ONE tag with
// matching value in incident.tags
export const matchesOnTags = (incident: Incident, tags: Tag[]): boolean => {
  if (tags.length === 0) {
    return true;
  }

  const incidentTagsSet = new Set(incident.tags.map((it: IncidentTag) => it.tag));
  const tagsGroupedByKey: Map<string, Set<Tag>> = groupBy(tags, (tag: Tag) => tag.key);
  const returnVal = [...tagsGroupedByKey.keys()].every((tagKey: string) => {
    const tagsOnKey = tagsGroupedByKey.get(tagKey) || new Set<Tag>();
    return [...tagsOnKey.values()].some((tag: Tag) => incidentTagsSet.has(tag.original));
  });
  return returnVal;
};

export const matchesOnSources = (incident: Incident, sources: number[] | undefined): boolean => {
  if (sources === undefined || sources.length === 0) {
    return true;
  }
  return sources.some((source: number) => incident.source.pk === source);
};

export const matchesShow = (incident: Incident, show: "open" | "closed" | "both"): boolean => {
  if (show === "both") return true;
  const openState = show == "open";
  return incident.open === openState;
  // return incident.open ? show === "open" : show === "closed";
};

export const matchesAcked = (incident: Incident, showAcked: boolean): boolean => {
  if (showAcked) return true;
  return !incident.acked;
};

interface FilterProps {
  show: "open" | "closed" | "both";
  showAcked: boolean;
  tags: Tag[];
  sourcesById: number[] | undefined;
}

export const matchesFilter = (incident: Incident, filter: FilterProps): boolean => {
  /*
      // Useful for debugging
      const matches = [
        ["open", incident.open, filter.show, matchesShow(incident, filter.show)],
        ["acked", incident.acked, filter.showAcked, matchesAcked(incident, filter.showAcked)],
        ["tags", incident.tags, filter.tags, matchesOnTags(incident, filter.tags)],
        ["source", incident.source, filter.sourcesById, matchesOnSources(incident, filter.sourcesById)],
      ];

      console.debug("Checking match on filter: ");
      matches.forEach(([name, incidentValue, filterValue, match]) => {
        console.debug(match ? "match" : "fail", `${name}: `, incidentValue, filterValue);
      });

      return matches.every(([name, incidentValue, filterValue, match]) => match);
   */

  return (
    matchesShow(incident, filter.show) &&
    matchesAcked(incident, filter.showAcked) &&
    matchesOnTags(incident, filter.tags) &&
    matchesOnSources(incident, filter.sourcesById)
  );
};

export const FilteredIncidentsProvider = ({
  filterMatcher,
  children,
}: {
  filterMatcher: ((incident: Incident) => boolean) | undefined;
  children?: React.ReactNode;
}) => {
  const { state, dispatch } = useContext(IncidentsContext);

  // This isn't efficient, but it is efficient enough.
  const newState: IncidentsStateType = useMemo(() => {
    if (filterMatcher === undefined) return state;
    const incidents = state.incidents.filter(filterMatcher);
    const _indexByPk = createIncidentsIndex(incidents);
    return { incidents, _indexByPk, lastModified: state.lastModified };
  }, [filterMatcher, state]);

  return <IncidentsContext.Provider value={{ state: newState, dispatch }}>{children}</IncidentsContext.Provider>;
};

export default FilteredIncidentsProvider;
