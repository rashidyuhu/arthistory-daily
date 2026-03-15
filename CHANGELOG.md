# Changelog

All notable changes to Art History Daily will be documented in this file.

## [1.0.1] - 2025-03-07

### Fixed

- **Daily artwork refresh**: Artwork now updates correctly when opening the app on a new day. Previously, the app could show the same artwork if it had been in the background overnight.
- **Artwork selection algorithm**: Fixed seeded random number generator to use correct range [0, 1) and handle seed 0 edge case, ensuring consistent daily rotation without out-of-bounds errors.
- **Info text**: Corrected "midnight UTC" to "midnight (in your timezone)" in the About section.

## [1.0.0] - Initial release

- One artwork per day from National Gallery of Art
- 3D flip card interface
- Detailed artwork information
- Open Access collection
