# Changes
This file documents all changes to Argus-frontend. This file is primarily meant to be read by developers.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This project uses [*towncrier*](https://towncrier.readthedocs.io/) and the changes for the upcoming release can be found in the [changelog.d/](./changelog.d/) directory.

<!-- towncrier release notes start -->

## [v1.14.1] - 2024-04-24

### Fixed

- Updated package-lock.json

## [v1.14.0] - 2024-04-22


### Added

- Missing article in ticket generation modal.
  ([#552](https://github.com/Uninett/Argus-frontend/issues/552))
- Link to Django administration site for users with admin permissions. Link is
  available in the user menu dropdown.
  ([#553](https://github.com/Uninett/Argus-frontend/issues/553))
- Added towncrier to automatically produce changelog

### Changed

- Styling in the user menu dropdown: added a horizontal divider and icons.
  ([#553](https://github.com/Uninett/Argus-frontend/issues/553))
- _Incident ID in \<its source system\>_ field to incident details view, which
  displays ID by which incident is referenced internally in its source system.
  ([#557](https://github.com/Uninett/Argus-frontend/issues/557))

### Fixed

- Bug with blank page being rendered when manually refreshing, or copy-pasting
  incident permalinks
  ([#562](https://github.com/Uninett/Argus-frontend/issues/562))


## [v1.13.0] - 2024-04-10

### Changed

- Configuration values can now be changed at runtime in development and production environments. See the docs for info about how to properly configure the frontend application in production.
- Upgraded lots of dependencies


## [v1.12.0] - 2023-09-28

### Fixed

- Error handling on filter deletion.

### Added
- Users can give custom names to Notification profiles via _Title_ input field.
- Scrollbar to the _Acknowledgements_- and _Events_-feed in the detailed incident view.

### Fixed
- Uniform alignment of the input fields in the notification profiles.
- Bug with endless calls to destinations endpoint from the /notificationprofiles page. 


## [v1.11.0] - 2023-09-19

This version strongly prefers argus-server version 1.13 or newer.

### Fixed

- There was a race condition when looking at destinations in notification
  profiles. This lead to weird behavior (rows loading in very late)
  particularly on flaky networks.

### Changed

- How the actual filter is saved and used changed in the backend with v1.13, so
  the frontend was updated to use the new method.


## [v1.10.1] - 2023-05-02

### Changed

- Updated dependencies


## [v1.10.0] - 2023-04-28

### Added
- Handling of both network errors, and errors with fetching existing user in _Login view_ .

### Fixed
- Bug with misleading error message in Login view on connection problems.

### Changed

- Made _LOGIN WITH FEIDE_ button more generic. 
- _LOGIN WITH FEIDE_ will not render by default anymore. Instead, _LOGIN WITH_ button will only render if there are configured login methods that are other than userpass.
- Updated user manual


## [v1.9.0] - 2023-03-17

### Changed

- _Settings_ are replaced with _Destinations_. User may now create/update/delete emails and other media (that are configured), in addition to phone numbers.
- Switched to API v.2 calls for notification profiles
- The structure of notification profiles: removed the _Media_-selector, replaced the _Phone number_-selector with the _Destinations_-selector. User can now select multiple destinations per notification profile.
- Replaced _add phone number from notification profiles_ feature  with _add destination from notification profiles_ feature.
- Removed all use of _phone numbers_, except for phone numbers as a part of _destinations_.


## [v1.8.1] - 2023-02-15

### Fixed

- Ensure that description is stored properly when acking, both in bulk and directly

## [v1.8.0] - 2023-02-02

### Added

- Visual feedback (table loading) when changing incident filter parameters, and when navigating incident table pages
- Use backend bulk endpoints to speed up updating incidents in bulk

## [v1.7.0] - 2022-12-16

### Added
- Create ticket feature


## [v1.6.1] - 2022-10-13

### Fixed

- Show correct version number

## [v1.6.0] - 2022-10-13

### Fixed

- Fix help text refering to a singular incident when ACK-ing or closing multiple incidents with the bulk operation feature.
- Fix ARGUS logo clipping part of the name.
- Fix misleading error message on successful incident update. Bug appeared for incidents that were selected by user, but which were on the table page(s) that were out of view.
- Fix CLOSE/RE-OPEN button so that it does not disappear if user selects incidents on different table pages
- Fix a bug in Timeslot's time pickers where changing start-/end time via icon, leads to wrong values being registered, misleading error text being displayed, and "Save"-button being disabled
- Fix a bug in Timeslot's time pickers where typing invalid values for both start- and end time (both input fields display error text), disrupts further changes (incl. corrections) of those time values
- Fix a bug in Timeslot's time pickers where error text is not always removed and "Save"-button is disabled, even after user has provided valid and non-conflicting values (time range where start time is before end time)
- Fix bug where incidents count was messed up due to user switching between table pages too rapidly
- Labeling of "Unacked" chips and buttons is now consistent.
- Incidents page does not blank out anymore when selecting an old-style filter (filter created before 2023).
- Fix a bug where the day selector menu for timeslots would jump around when selecting days.
- Fix a bug where pressing enter while creating or updating a phone number refreshed the page instead of actually
creating or updating the phone number.

### Changed

- Rename the label for the severity level selector from "Max level" to "Max severity level"
- Allow reuse of timeslots in different notification profiles.
- All notification profile changes are handled via PUT endpoint.
- Individual success alerts are replaced with a consolidated success message for bulk updates (bulk ack, bulk add/ticket etc.)
- Logo to the one with eye and text (without TV-frame)
- Favicon to the one with eye-only
- Add seconds to timestamps in elements of the event feed in detailed incident view
- Order of events and acknowledgements in feed in detailed incident view. Order is now oldest-first.
- Made docker-compose build more flexible.
- Make it easier/more obvious to save a profile without a phone number by selecting the option "None".
- Option "None" is default in the phone number selector in notification profiles.
- Updated the phonenumber component to have prettier and more sensible css.
- Removed useless _Filter List_ button from the incidents table header.

### Added

- End time to the incident detailed view (for closed incidents only)
- User manual.
- SMS media plugin in docker-compose env.
- Select-all-incidents per page feature. Several pages can be selected/de-selected at a time
- Info bar that drops below the app header while any of the bulk operations (bulk ack, bulk re-open etc.) is ongoing
- Separate callbacks for bulk operations in /src/api/actions.ts
- Logic for storedIncidents in global state

## [v1.5.4]

### Fixed

- Flickering of incidents table, and detailed incidents view when Interval update method is selected.
- Bug with table filtering where selecting tags/sources led to wrong incidents being displayed.

### Added

- Documented `REACT_APP_COOKIE_DOMAIN` variable.

## [v1.5.3]

### Fixed
- Bug where app crashed on Feide logout.
- Global state for authentication: clean setting/removal of cookies for both userpass and federated login.

## [v1.5.2]

### Fixed

- When bulk ack or close/re-open is successfully completed, affected incidents are still selected and multi-action bar does not disappear anymore.
- Correct re-render of the user icon in the header.

### Changed

- Polished filter look in the mobile-view.

## [v1.5.1]

### Fixed

- Fix invalid time bug in Safari, where Incidents page was blanked out.
- All required input fields are correctly marked on all pages.
- Proper error cause (from backend) is shown in alert snackbars.
- Frontend does not crash anymore when backend is offline.
- Proper error handling and error helper texts when working with timeslots and recurrences.

### Changed

- Redesigned Notification profile page.
- How table filtering works: use CSS for truncating text instead of JS, useUser() hooks, refactoring to make development process better.

### Added

- Tests for: Login, IncidentView, Notification profiles, Incident table, Incident filter toolbar, Incident update operations (ack, add ticket, open, close).
- Config flag to hide severity levels.
- Mobile-view on all Argus pages.
- Bulk add-ticket-url feature.
- Incident severity level as one of the filtering options.
- Success/error alerts on all bulk-operations on incidents (ack, add-ticket-url, open, close).
- The ability to filter out older incidents via Timeframe selector.
- Display of frontend-, backend- and API versions below the incidents table.
