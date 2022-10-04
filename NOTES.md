# Release Notes
This file documents changes to Argus-frontend that are important for the users to know.

## [Unreleased]

### Changed
- Logo to the one with eye and text (without TV-frame)
- Favicon to the one with eye-only

- Made docker-compose build more flexible.


### Added
- SMS media plugin in docker-compose env.




## [Released]

### Fixed
- Global state for authentication: clean setting/removal of cookies for both userpass and federated login.

### Changed
- How table filtering works: use CSS for truncating text instead of JS, useUser() hooks, refactoring to make development process better.

### Added
- Tests for: Login, IncidentView, Notification profiles, Incident table, Incident filter toolbar, Incident update operations (ack, add ticket, open, close).
- Config flag to hide severity levels.
- Documented REACT_APP_COOKIE_DOMAIN variable.
