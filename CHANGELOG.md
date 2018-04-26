# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] - 2018-4-25
### Added
- New statusbar button to quickly finish features, releases, or hotfixes
- New keyboard shortcuts for quickly running commands
- New configuration value, askBeforeDeletion. When finishing a feature, release, and/or hotfix, you will now be asked if you would like to delete the branch (only local not remote if you have pushed it). Setting is true by default. If you set to false, it will follow the behavior of the deleteBranch setting.
- New configuration value, deleteBranchByDefault. When finishing a feature, release, and/or hotfix, this setting will determine if the branch is deleted by default or not. Setting is false by default. If you set to true, and askBeforeDeletion is set to false, then branches will be deleted without question.
### Changed
- In support of the new statusbar button, the command menu structure had to be changed somewhat. Starting & Finishing features, releases, and/or hotfixes commands are now listed on the command menu (Cmd+P/Ctrl+P), as are Initialize and Git Status.

## [1.1.0] - 2018-4-16
### Added
- Ability to create release and/or hotfix branches based on branches other than default branch ("development" and "production" respectively)
### Changed
- Ability to now create feature branches based on branches other than "development" branch, prior release only allowed to create features off of either development or another "feature"

## [1.0.0] - 2017-9-14
### Added
- Ability to create feature branches based on branches other than "development" branch

### Changed
- Edited the README.md to be more robust on how to use the extension

## [0.1.3] - 2017-8-31
### Fixed
- Error when finishing Release or Hotfix with tagging

## [0.1.2] - 2017-8-31
### Added
- Ability to initialize git flow repository settings using custom values

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
- First version of extension
- Allowed for creation of features, releases, hotfixes
- Functionality to convert spaces to _ in branch names

