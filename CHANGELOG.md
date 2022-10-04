# Changes
This file documents all changes to Argus-frontend. This file is primarily meant to be read by developers.

## [Unreleased]

### Fixed
- Fix ARGUS logo clipping part of the name.

### Changed
- Logo and favicon
- Add seconds to timestamps in elements of the event feed in detailed incident view


## [Released]

### Fixed
- Fix invalid time bug in Safari, where Incidents page was blanked out.
- When bulk ack or close/re-open is successfully completed, affected incidents are still selected and multi-action bar does not disappear anymore.
- All required input fields are correctly marked on all pages.
- Proper error cause (from backend) is shown in alert snackbars.
- Frontend does not crash anymore when backend is offline.
- Proper error handling and error helper texts when working with timeslots and recurrences.
- Flickering of incidents table, and detailed incidents view when Interval update method is selected.
- Bug where app crashed on Feide logout.
- Bug with table filtering where selecting tags/sources led to wrong incidents being displayed.

### Changed
- Redesigned Notification profile page.

### Added
- Mobile-view on all Argus pages.
- Bulk add-ticket-url feature.
- Incident severity level as one of the filtering options.
- Success/error alerts on all bulk-operations on incidents (ack, add-ticket-url, open, close).
- The ability to filter out older incidents via Timeframe selector.
- Display of frontend-, backend- and API versions below the incidents table.
