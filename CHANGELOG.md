## upcoming release (no planned release date)

#### New features
- Stash is now fully translatable, with a German translation available initially  
  Pull requests welcome!

#### Changes
- Electron has been upgraded to v7.1.5
- Ubuntu 18.04 is now the minimum required version

#### Bugs fixed
- *Show more* link in authorization history window now actually works
- Navigating to the clicked Stash link on application start has been fixed
- On multi-monitor setups, the window should no longer open on a disconnected screen
- Errors on push due to failed remote hooks are no longer ignored
- Invalid URLs in entries are now silently ignored
- Authorization changes in the 'Folder access' view are now correctly saved
- Display of long description values has been improved

## v1.2.0 (2018-12-14)

#### New features
- **Git history support**
  - The *Modified* column is now based on git history instead of local file date
  - A history popup has been added for user keys, folders and folder permissions
  - The history of entries can now be accessed by a dropdown in the lower panel
  - The full git commit log is now viewable in the status popup
- SSH key format can now be toggled between fingerprint and full display, defaulting to SHA256 fingerprint
- Public SSH keys can now be copied to clipboard
- Stash links can now also be shared for folders
- A shiny new splashscreen now tries to mask the unfathomably long loading times
- KeePass import now creates entries for binary attachments
- **KeePass export** is now available in the folder bars menu
- The settings page now remembers the list of recent repositories
- Private key management has been moved from settings to the new **account status menu**, adding a list of recently used key files
- The strength of a generated private key can now be selected (2048/4096 bits)
- Fields can now be copied to clipboard using hotkeys known from KeePass (Ctrl+B, Ctrl+C, Ctrl+Shift+U)

#### Changes
- The *My Favorites* link and the tool icons now remain visible when scrolling
- The search scope is now highlighted when set to *current folder*
- UI scale now defaults to 15 for new installations

#### Bugs fixed
- Number settings fields no longer accept garbage input (and show a nice spinner as a bonus)
- The current selection is now remembered on reload / git update
- Git clone from SSH (using agent) no longer fails with *unsupported credentials type* error
- Fixed *create item* button being enabled before permissions have been initially set up (with warning message)
- Pushing the initial commit to an empty repository should now work
- The *uncommitted changes* warning on quit should now work reliably

## v1.1.0 (2017-12-18)

This release adds some of the most requested features in v1.0.0 and fixes some bugs.

#### New features
- Folders can now be moved and merged by dragging the label onto another folder
- Added an edit icon in the breadcrumb bar for quick folder renaming
- A new 👁 icon in the folder tree allows you to hide inaccessible items (files and folders; off by default)
- When copying password data, the clipboard is now cleared after 30s
- New views on the *Users* page allow a quick breakdown of user rights:
  - *Permissions* lists all granted permissions for each user
  - *Access* provides an editable map of access rights per folder
- The changelog is now included on the *Settings* page

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

## v1.0.0 (2017-11-27)

First stable release.
