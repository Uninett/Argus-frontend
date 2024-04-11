# Release Notes

This file documents changes to Argus-frontend that are important for the users to know.

## [Unreleased]

### Added

- Missing article in ticket generation modal.



## [v1.13.0] - 20204-04-10

Configuration values can now be changed at runtime in development and production
environments. The defaults are as before in `src/config.tsx` but now all of the
options can be set via **environment** variables.

See the Configuration-section in the README for more details.


## [v1.12.0] - 2023-09-28

### Fixed

- Error handling on filter deletion.

### Added
- Users can give custom names to Notification profiles via _Title_ input field. 
- Scrollbar to the _Acknowledgements_- and _Events_-feed in the detailed incident view.

### Fixed
- Uniform alignment of the input fields in the notification profiles.
- Bug with endless calls to destinations endpoint from the /notificationprofiles page. Bug did not create any noticeable lag in the browser.


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

- The structure of notification profiles: removed the _Media_-selector, replaced the _Phone number_-selector with the _Destinations_-selector. User can now select multiple destinations per notification profile.
- _Settings_ are replaced with _Destinations_. It is now possible to create/update/delete email addresses and other destinations (that are configured), in addition to phone numbers.
- Replaced _add phone number from notification profiles_ feature  with _add destination from notification profiles_ feature.

## [v1.8.0] - 2023-02-15

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

- Fix ARGUS logo clipping part of the name.
- Fix a bug in Timeslot's time pickers where changing start-/end time via icon, leads to wrong values being registered, misleading error text being displayed, and "Save"-button being disabled
- Fix a bug in Timeslot's time pickers where typing invalid values for both start- and end time (both input fields display error text), disrupts further changes (incl. corrections) of those time values
- Fix a bug in Timeslot's time pickers where error text is not always removed and "Save"-button is disabled, even after user has provided valid and non-conflicting values (time range where start time is before end time)
- Labeling of "Unacked" chips and buttons is now consistent.
- Incidents page does not blank out anymore when selecting an old-style filter (filter created before 2023).
- Fix misleading error message on successful incident update. Bug appeared for incidents that were selected by user, but which were on the table page(s) that were out of view.
- Fix CLOSE/RE-OPEN button so that it does not disappear if user selects incidents on different table pages

### Changed

- Allow reuse of timeslots in different notification profiles.
- Rename the label for the severity level selector from "Max level" to "Max severity level"
- Logo and favicon
- Add seconds to timestamps in elements of the event feed in detailed incident view
- Order of events and acknowledgements in feed in detailed incident view. Order is now oldest-first.
- Removed useless _Filter List_ button from the incidents table header.
- Make it easier/more obvious to save a profile without a phone number by selecting the option "None".
- Option "None" is default in the phone number selector in notification profiles.
- Individual success alerts are replaced with a consolidated success message for bulk updates (bulk ack, bulk add/ticket etc.)

### Added

- Select-all-incidents per page feature. Several pages can be selected/de-selected at a time
- Info bar that drops below the app header while any of the bulk operations (bulk ack, bulk re-open etc.) is ongoing
- End time to the incident detailed view (for closed incidents only)
- User manual.

## [v1.5.4]

### Fixed

- Flickering of incidents table, and detailed incidents view when Interval update method is selected.
- Bug with table filtering where selecting tags/sources led to wrong incidents being displayed.

## [v1.5.3]

### Fixed

- Bug where app crashed on Feide logout.

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

### Added

- Mobile-view on all Argus pages.
- Bulk add-ticket-url feature.
- Incident severity level as one of the filtering options.
- Success/error alerts on all bulk-operations on incidents (ack, add-ticket-url, open, close).
- The ability to filter out older incidents via Timeframe selector.
- Display of frontend-, backend- and API versions below the incidents table.
