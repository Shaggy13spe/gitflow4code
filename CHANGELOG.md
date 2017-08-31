# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.1.1] - 2017-8-30
### Added
- Ability to initialize git flow repository settings

### Changed
- Removed need for gitflow or gitflow-avh to be installed prior to using the extension. All commands now run organic git commands

### Fixed
- Error that occurred when trying to use the extension that claimed there wasn't a git repo in the current or any parent folder

## [0.0.5] - 2017-1-26
### Added
- This CHANGELOG file.

### Changed
- Updated README file.
- Updated package.json to add keywords and badges

## [0.0.4] - 2017-1-26
### Fixed
- Hotfixes require a TAG to be defined, but extension didn't support it, thus it wouldn't finish releases

## 0.0.3 [UNRELEASED]
### Fixed
- Releases require a TAG to be defined, but extension didn't support it, thus it wouldn't finish releases

## [0.0.2] - 2016-6-28
### Added
- Functionality to check for illegal characters in branch names


### Changed
- How git directory is found. No longer need to have code file open

## [0.0.1] - 2016-5-3
### Added
- First version of extenstion
- Allowed for creation of features, releases, hotfixes
- Functionality to convert spaces to _ in branch names

