# Changes
This file documents all changes to Argus-frontend. This file is primarily meant to be read by developers.

## [Unreleased]

### Fixed
- Fix ARGUS logo clipping part of the name.
- Fix a bug in Timeslot's time pickers where changing start-/end time via icon, leads to wrong values being registered, misleading error text being displayed, and "Save"-button being disabled 
- Fix a bug in Timeslot's time pickers where typing invalid values for both start- and end time (both input fields display error text), disrupts further changes (incl. corrections) of those time values
- Fix a bug in Timeslot's time pickers where error text is not always removed and "Save"-button is disabled, even after user has provided valid and non-conflicting values (time range where start time is before end time) 



### Changed
- Logo and favicon
- Add seconds to timestamps in elements of the event feed in detailed incident view
- Order of events and acknowledgements in feed in detailed incident view. Order is now oldest-first.



### Added
- End time to the incident detailed view (for closed incidents only)
- User manual.

