import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import Dialogue from "../dialogue/Dialogue";
import Spinner from "../spinners/Spinner";
import "./Profile.css";
import api, {
  NotificationProfile,
  NotificationProfilePK,
  NotificationProfileKeyed,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
  MediaAlternative,
} from "../../api";
import { pkGetter, toMap, debuglog } from "../../utils";
import Selector, { SelectOptionsType } from "../selector";
import Select from "react-select/src/Select";

type ProfileProps = {
  // if not set this means that it doesn't exist in the database
  pk?: NotificationProfilePK;

  active: boolean;
  exists?: boolean;

  filters: Map<FilterPK, Filter>;
  timeslots: Map<TimeslotPK, Timeslot>;
  mediums: { label: string; value: MediaAlternative }[]; // XXX: Rename in backend as well?

  selectedFilters: Filter[];
  selectedMediums: MediaAlternative[];
  selectedTimeslot?: Timeslot;

  isTimeslotInUse: (timeslot: Timeslot) => boolean;

  onSavedDelete: (pk: NotificationProfilePK) => void;
  onNewDelete: (pk?: NotificationProfilePK) => void;

  onSavedUpdate: (profile: NotificationProfile) => void;
  onNewCreate: (profile: Omit<NotificationProfileKeyed, "pk">) => void;

  onUpdate?: (profile: Partial<NotificationProfile>) => void;
};

const Profile: React.FC<ProfileProps> = ({
  pk,
  active,
  exists,

  filters,
  timeslots,
  mediums,
  selectedMediums,
  selectedFilters,
  selectedTimeslot,

  isTimeslotInUse,

  onNewDelete,
  onSavedDelete,

  onNewCreate,
  onSavedUpdate,

  onUpdate,
}: ProfileProps) => {
  const [hasChanged, setHasChanged] = useState<boolean>(!exists);
  const [changedTimeslot, setChangedTimeslot] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<Partial<NotificationProfile>>({
    active,
    filters: [...selectedFilters.values()],
    timeslot: selectedTimeslot,
    media: [...selectedMediums.values()],
  });

  const saveProfile = async (profile: Partial<NotificationProfile>) => {
    debuglog("postnewprofile");
    if (
      profile &&
      profile.active !== undefined &&
      profile.filters !== undefined &&
      profile.media !== undefined &&
      profile.timeslot !== undefined
    ) {
      if (exists && pk !== undefined && !changedTimeslot) {
        console.log("calling onSavedUpdate");
        onSavedUpdate({
          pk: pk,
          timeslot: profile.timeslot,
          filters: profile.filters,
          media: profile.media,
          active: profile.active,
        });
      } else {
        console.log("calling onNewCreate", profile);
        onNewCreate({
          timeslot: profile.timeslot.pk,
          filters: profile.filters.map((filter: Filter): FilterPK => pkGetter<FilterPK, Filter>(filter)),
          media: profile.media,
          active: profile.active,
        });

        if (exists && pk !== undefined && changedTimeslot) {
          // Delete the previous profile using the old timeslot.
          // TODO: This could probably be done better.
          onSavedDelete(pk);
          setChangedTimeslot(false);
        }
      }
      setHasChanged(false);
    } else {
      console.log("not all values set, cannot create");
      console.log(profile);
      setProfile(profile);
    }
  };

  function onSelectTimeslot(timeslot?: Timeslot | Timeslot[]) {
    console.log("On timeslot Change", timeslot);
    if (Array.isArray(timeslot)) {
      return;
    }

    if (selectedTimeslot === undefined || (timeslot && selectedTimeslot.pk != timeslot.pk)) {
      setHasChanged(true);
      setChangedTimeslot(true); // this requires a post instead of a put
      setProfile((profile: Partial<NotificationProfile>) => ({ ...profile, timeslot }));
    }
  }

  function onSelectFilters(selectedFilters?: Filter | Filter[]) {
    console.log("On selectedFilters Change", selectedFilters);

    if (!Array.isArray(selectedFilters) || !selectedFilters) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, filters: [] };
      });
      return;
    }

    if (selectedFilters !== profile.filters) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, filters: selectedFilters || [] };
      });
    }
  }

  function onSelectMediums(selectedMediums?: SelectorMediaAlternative | SelectorMediaAlternative[]) {
    console.log("On selectedMediums Change", selectedMediums);

    if (!Array.isArray(selectedMediums) || !selectedMediums) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, media: [] };
      });
      return;
    }

    const mediums = (selectedMediums || []).map((medium: SelectorMediaAlternative) => medium.pk);
    if (mediums !== profile.media) {
      setHasChanged(true);
      setProfile((profile: Partial<NotificationProfile>) => {
        return { ...profile, media: mediums };
      });
    }
  }

  function onActiveChanged() {
    console.log("onActiveChanged");
    setHasChanged(true);
    setProfile((profile: Partial<NotificationProfile>) => {
      return { ...profile, active: !!!profile.active };
    });
  }

  // TODO: only temporary for testing with already used ProfileList
  const enabledFiltersKeys: Set<FilterPK> = new Set<FilterPK>(
    (profile.filters || []).map((filter: Filter) => filter.pk),
  );
  const enabledTimeslotKeys: Set<TimeslotPK> = new Set<TimeslotPK>(profile.timeslot ? [profile.timeslot.pk] : []);

  type SelectorMediaAlternative = {
    pk: MediaAlternative;
    name: string;
  };
  function mediumsToOptions(mediums: { label: string; value: MediaAlternative }[]): SelectorMediaAlternative[] {
    return mediums.map((medium: { label: string; value: MediaAlternative }) => ({
      pk: medium.value,
      name: medium.label,
    }));
  }

  return (
    <div className="notification-container">
      <div className="check-box">
        <h4 className="activate-box">Active:</h4>
        <Checkbox
          checked={profile.active}
          onChange={onActiveChanged}
          value="checkBox"
          color="primary"
          inputProps={{
            "aria-label": "secondary checkbox",
          }}
        />
      </div>
      <div className="filtername-box">
        <div className="filtername">
          <h4>Filtername:</h4>
        </div>
        <div className="filter-dropdown multi-select">
          <Selector<Filter, FilterPK>
            key={"filterselector"}
            multiSelect
            options={filters}
            enabledOptionsKeys={enabledFiltersKeys}
            onSelectChange={onSelectFilters}
          />
        </div>
      </div>
      <div className="dropdown-timeslots">
        <h4>Timeslots:</h4>
        <div className="timeslot-dropdown">
          <Selector<Timeslot, TimeslotPK>
            key={"timeslotselector"}
            options={timeslots}
            enabledOptionsKeys={enabledTimeslotKeys}
            onSelectChange={onSelectTimeslot}
            isOptionDisabled={(timeslot: Timeslot): boolean => isTimeslotInUse(timeslot)}
          />
        </div>
      </div>
      <div className="dropdown-media">
        <h4>Media:</h4>
        <div className="dropdown-media multi-select">
          <Selector<SelectorMediaAlternative, MediaAlternative>
            multiSelect
            key={"mediaselector"}
            options={toMap<MediaAlternative, SelectorMediaAlternative>(
              mediumsToOptions(mediums),
              (mediumOption: SelectorMediaAlternative) => mediumOption.pk,
            )}
            enabledOptionsKeys={new Set<MediaAlternative>([...selectedMediums.values()])}
            onSelectChange={onSelectMediums}
          />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-save">
          {loading ? (
            <Spinner />
          ) : hasChanged ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                setLoading(true);
                saveProfile(profile);
                setLoading(false);
              }}
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          ) : (
            <Button disabled variant="contained" color="primary" size="small" startIcon={<SaveIcon />}>
              Save
            </Button>
          )}
        </div>
        <div className="button-delete">
          <Dialogue
            handleDelete={() => {
              if (pk) {
                onSavedDelete(pk);
              } else onNewDelete(undefined);
            }}
          />
        </div>
      </div>
    </div>
  );
};

Profile.defaultProps = {
  exists: false,
};

export default Profile;
