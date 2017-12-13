# upcoming v1.1.0 (planned 2017-12-xx)

This release adds some of the most requested features in v1.0.0 and fixes some bugs.

#### New features
- Folders can now be moved and merged by dragging the label onto another folder
- Added an edit icon in the breadcrumb bar for quick folder renaming
- A new 👁 icon in the folder tree allows you to hide inaccessible items (files and folders; off by default)
- When copying password data, the clipboard is now cleared after 30s
- New views on the *Users* page allow a quick breakdown of user rights:
  - *Permissions* lists all granted permissions for each user
  - *Access* provides a map of access rights per folder

#### Changes
- The password generator dropdown now uses the same colors as the strength meter

#### Bugs fixed
- Closing the permissions popup with the ESC key should now work
- The non-functional "delete" context menu entry on the repository root has been removed
- The git login window should no longer pop up every minute when applying saved credentials fails or is cancelled
- A bug that could cause corrupted items on certain folder operations has been fixed
- Fixed initial git fetch preventing repo detection under bad network conditions
- Conflicts in internal JSON files should now be resolved more intelligently, preventing JSON parsing exceptions
- Permissions of empty folders can now set without authorization, as intended

# v1.0.0 (2017-11-27)

First stable release.
