import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import Spinning from "../spinning";
import { makeConfirmationButton } from "../buttons/ConfirmationButton";

import "./Profile.css";
import type {
  NotificationProfile,
  NotificationProfilePK,
  NotificationProfileKeyed,
  Filter,
  FilterPK,
  Timeslot,
  TimeslotPK,
  MediaAlternative,
  PhoneNumber,
} from "../../api/types.d";
import { useStateWithDynamicDefault, pkGetter, toMap } from "../../utils";
import Selector from "../selector";

type ProfileProps = {
  // if not set this means that it doesn't exist in the database
  pk?: NotificationProfilePK;
  disabled?: boolean;

  active: boolean;
  exists?: boolean;
  unsavedChanges: boolean;

  filters: Map<FilterPK, Filter>;
  timeslots: Map<TimeslotPK, Timeslot>;
  phoneNumbers: PhoneNumber[];

  // TODO: Rename to media here (plural of medium),
  // and rename MediaAlternative to Medium
  mediums: { label: string; value: MediaAlternative }[];

  selectedFilters: Filter[];
  selectedMediums: MediaAlternative[];
  selectedTimeslot?: Timeslot;

  phoneNumber: PhoneNumber | null;

  isTimeslotInUse: (timeslot: Timeslot) => boolean;

  onSavedDelete: (pk: NotificationProfilePK) => void;
  onNewDelete: (pk?: NotificationProfilePK) => void;

  onSavedUpdate: (profile: NotificationProfile) => void;
  onNewCreate: (profile: Omit<NotificationProfileKeyed, "pk">) => void;

  onUpdate?: (profile: Partial<NotificationProfile>) => void;
};

const Profile: React.FC<ProfileProps> = ({
  pk,
  disabled,
  active,
  exists,
  unsavedChanges,

  filters,
  timeslots,
  mediums,
  phoneNumbers,

  selectedMediums,
  selectedFilters,
  selectedTimeslot,

  phoneNumber,
  isTimeslotInUse,

  onNewDelete,
  onSavedDelete,

  onNewCreate,
  onSavedUpdate,
}: ProfileProps) => {
  const [hasChanged, setHasChanged] = useStateWithDynamicDefault<boolean>(unsavedChanges);
  const [isDisabled, setIsDisabled] = useStateWithDynamicDefault<boolean | undefined>(disabled);

  const [changedTimeslot, setChangedTimeslot] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [profile, setProfile] = useState<Partial<NotificationProfile>>({
    active,
    filters: [...selectedFilters.values()],
    timeslot: selectedTimeslot,
    media: [...selectedMediums.values()],
    // eslint-disable-next-line @typescript-eslint/camelcase
    phone_number: phoneNumber,
  });

  const saveProfile = async (profile: Partial<NotificationProfile>) => {
    if (
      profile &&
      profile.active !== undefined &&
      profile.filters !== undefined &&
      profile.media !== undefined &&
      profile.timeslot !== undefined &&
      profile.phone_number !== undefined
    ) {
      if (exists && pk !== undefined && !changedTimeslot) {
        setIsDisabled(true);
        onSavedUpdate({
          pk: pk,
          timeslot: profile.timeslot,
          filters: profile.filters,
          media: profile.media,
          active: profile.active,
          // eslint-disable-next-line @typescript-eslint/camelcase
          phone_number: profile.phone_number,
        });
      } else {
        setIsDisabled(true);
        if (exists && pk !== undefined && changedTimeslot) {
          // Delete the previous profile using the old timeslot.
          // TODO: This could probably be done better.
          onSavedDelete(pk);
          setChangedTimeslot(false);
        }
        onNewCreate({
          timeslot: profile.timeslot.pk,
          filters: profile.filters.map((filter: Filter): FilterPK => pkGetter<FilterPK, Filter>(filter)),
          media: profile.media,
          active: profile.active,
          // eslint-disable-next-line @typescript-eslint/camelcase
          phone_number: profile.phone_number ? profile.phone_number.pk : null,
        });
      }
      // setHasChanged(false);
    } else {
      // TODO: maybe disable the save button or something?
      console.log("not all values set, cannot create");
      console.log(profile);
      setProfile(profile);
    }
  };

  function onSelectTimeslot(timeslot?: Timeslot | Timeslot[]) {
    if (Array.isArray(timeslot)) {
      return;
    }

    if (selectedTimeslot === undefined || (timeslot && selectedTimeslot.pk !== timeslot.pk)) {
      setHasChanged(true);
      setChangedTimeslot(true); // this requires a post instead of a put
      setProfile((profile: Partial<NotificationProfile>) => ({ ...profile, timeslot }));
    }
  }

  function onSelectFilters(selectedFilters?: Filter | Filter[]) {
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

  function onSelectPhoneNumber(phoneNumbers?: SelectorPhoneNumberAlternative | SelectorPhoneNumberAlternative[]) {
    if (Array.isArray(phoneNumbers)) {
      // NOT SUPPORTED ?
      return;
    }

    setHasChanged(true);
    setProfile((profile: Partial<NotificationProfile>) => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      return { ...profile, phone_number: phoneNumbers?.phoneNumber || null || null };
    });
    return;
  }

  function onActiveChanged() {
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

  type SelectorPhoneNumberAlternative = {
    pk: string;
    name: string;
    phoneNumber: PhoneNumber;
  };

  function phoneNumbersToOptions(phoneNumbers: PhoneNumber[]): SelectorPhoneNumberAlternative[] {
    return phoneNumbers.map((phoneNumber: PhoneNumber) => ({
      pk: phoneNumber.pk.toString(), // must convert to string and back...
      name: phoneNumber.phone_number,
      phoneNumber,
    }));
  }

  const isNew = (): boolean => {
    return (!exists && !pk) || changedTimeslot;
  };

  const saveButtonMsg = (): string => {
    return isNew() ? (updateLoading ? "Creating" : "Create") : updateLoading ? "Saving" : "Save";
  };

  const deleteButtonMsg = (): string => {
    return isNew() ? (deleteLoading ? "Aborting" : "Abort") : deleteLoading ? "Deleting" : "Delete";
  };

  const DeleteProfileConfirmationButton = makeConfirmationButton({
    title: `${deleteButtonMsg()} profile`,
    question: "Are you sure you want to remove this profile?",
    onConfirm: () => {
      setIsDisabled(true);
      setDeleteLoading(true);
      if (pk) {
        onSavedDelete(pk);
      } else onNewDelete(undefined);
    },
  });

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
          disabled={isDisabled}
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
            disabled={isDisabled}
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
            disabled={isDisabled}
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
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="dropdown-phonenumber">
        <h4>Phone number:</h4>
        <div className="dropdown-media multi-select">
          <Selector<SelectorPhoneNumberAlternative, PhoneNumber["phone_number"]>
            key={"phonenumberselector"}
            options={toMap<string, SelectorPhoneNumberAlternative>(phoneNumbersToOptions(phoneNumbers), pkGetter)}
            enabledOptionsKeys={
              profile.phone_number ? new Set<string>([profile.phone_number.pk.toString()]) : new Set()
            }
            onSelectChange={onSelectPhoneNumber}
            disabled={isDisabled}
          />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-save">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setUpdateLoading(true);
              saveProfile(profile);
            }}
            startIcon={updateLoading ? <Spinning shouldSpin /> : <SaveIcon />}
            disabled={!hasChanged || isDisabled}
          >
            {saveButtonMsg()}
          </Button>
        </div>
        <div className="button-delete">
          <DeleteProfileConfirmationButton
            variant="contained"
            color="secondary"
            size="small"
            startIcon={deleteLoading ? <Spinning shouldSpin /> : <DeleteIcon />}
            disabled={isDisabled}
          >
            {deleteButtonMsg()}
          </DeleteProfileConfirmationButton>
        </div>
      </div>
    </div>
  );
};

Profile.defaultProps = {
  exists: false,
};

export default Profile;
