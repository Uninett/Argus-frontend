# Release Notes
This file documents changes to Argus-frontend that are important for the users to know.

## [Unreleased]

### Fixed
- Fix misleading error message on successful incident update. Bug appeared for incidents that were selected by user, but which were on the table page(s) that were out of view.
- Fix CLOSE/RE-OPEN button so that it does not disappear if user selects incidents on different table pages

### Added
- Select-all-incidents per page feature. Several pages can be selected/de-selected at a time
- Info bar that drops below the app header while any of the bulk operations (bulk ack, bulk re-open etc.) is ongoing

### Changed
- Individual success alerts are replaced with a consolidated success message for bulk updates (bulk ack, bulk add/ticket etc.)
- Logo to the one with eye and text (without TV-frame)
- Favicon to the one with eye-only