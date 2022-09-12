# Changes
This file documents all changes to Argus-frontend. This file is primarily meant to be read by developers.

## [Unreleased]

### Fixed
- Fix ARGUS logo clipping part of the name.
- Fix misleading error message on successful incident update. Bug appeared for incidents that were selected by user, but which were on the table page(s) that were out of view.
- Fix CLOSE/RE-OPEN button so that it does not disappear if user selects incidents on different table pages

### Added
- Select-all-incidents per page feature. Several pages can be selected/de-selected at a time
- Info bar that drops below the app header while any of the bulk operations (bulk ack, bulk re-open etc.) is ongoing
- Separate callbacks for bulk operations in /src/api/actions.ts
- Logic for storedIncidents in global state

### Changed
- Individual success alerts are replaced with a consolidated success message for bulk updates (bulk ack, bulk add/ticket etc.)
- Logo and favicon
- Add seconds to timestamps in elements of the event feed in detailed incident view