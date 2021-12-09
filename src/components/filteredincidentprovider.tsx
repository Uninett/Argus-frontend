import React, { useContext, useMemo } from "react";

// Api
import type { Filter, Incident, IncidentTag, SeverityLevelNumber } from "../api/types.d";

// Utils
import { addHoursToDate, groupBy } from "../utils";

// Contexts/Hooks
import { IncidentsStateType, IncidentsContext, createIncidentsIndex } from "../components/incidentsprovider";

// Components
import { Tag, originalToTag } from "../components/tagselector";
import { SHOW_SEVERITY_LEVELS } from "../config";

// for all different tags "keys", THERE HAS TO BE ONE tag with
// matching value in incident.tags
export const matchesOnTags = (incident: Incident, tagStrings: string[]): boolean => {
  if (tagStrings.length === 0) {
    return true;
  }

  const tags = tagStrings.map((original: string) => originalToTag(original));

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

export const matchesShow = (incident: Incident, open?: boolean): boolean => {
  if (open === undefined) return true;
  return incident.open === open;
};

export const matchesAcked = (incident: Incident, acked?: boolean): boolean => {
  if (acked === undefined) return true;
  return incident.acked === acked;
};

export const matchesMaxlevel = (incident: Incident, maxlevel?: SeverityLevelNumber): boolean => {
  if (!SHOW_SEVERITY_LEVELS || maxlevel === undefined) return true;
  return incident.level <= maxlevel;
};

export const matchesFilter = (incident: Incident, filter: Omit<Filter, "pk" | "name">): boolean => {
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
    matchesShow(incident, filter.filter.open) &&
    matchesAcked(incident, filter.filter.acked) &&
    matchesOnTags(incident, filter.filter.tags) &&
    matchesOnSources(incident, filter.filter.sourceSystemIds) &&
    matchesMaxlevel(incident, filter.filter.maxlevel)
  );
};

export const matchesTimeframe = (incident: Incident, timeframeInHours: number): boolean => {
  if (timeframeInHours !== 0) {
    const timeframeStart = addHoursToDate(new Date(), -timeframeInHours);
    const incidentStart = new Date(incident.start_time);
    return incidentStart >= timeframeStart;
  }
  return true;
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
