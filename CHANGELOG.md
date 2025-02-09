## v1.4.0 (no planned release date)

#### New features

- Entries can now be securely shared on PrivateBin

#### Changes

- Electron has been upgraded to v27.1.3

## v1.3.0 (2023-04-04)

#### New features

- Quick search, "find in folder" and fulltext search options have been merged into a single search.  
  Results in the current folder are shown first, separated from the other results.
- Matches are now highlighted in search results

#### Changes

- Electron has been upgraded to v21.4.0
- macOS packages are now code-signed (thanks to [Tiffinger & Thiel GmbH](https://www.tiffinger-thiel.de)!)
- On Linux, Wayland display mode will be used automatically, matching the current XDG session
- A Flatpak package is now available
- The git conflict view now gives detailed information on which commit caused the conflict,
  and which files are affected

#### Bugs fixed

- Regression on "Open in default application" has been fixed (#8)
- Errors when encoutering git merge conflicts have been fixed (#9)
- Ctrl+L shortcut now works when the search field is focused
- OpenSSL is now statically linked on Linux (#15)

## v1.2.2 (2020-11-28)

#### Changes

- Electron has been upgraded to v9.1.2
- The maximum length and allowed characters of new usernames are now limited (#6)

#### Bugs fixed

- Configuring the git signature on initial setup has been fixed (#2)
- Main navbar should no longer scroll out of view (#3)
- On macOS, all hotkeys now use the ⌘ key instead of Ctrl (#5)
- On macOS, the main window is now properly restored from Dock (#7)

## v1.2.1 (2020-05-10)

#### New features

- Stash is now fully translatable, with a German translation available initially  
  Pull requests welcome!

#### Changes

- Electron has been upgraded to v8.0.3
- Ubuntu 18.04 is now the minimum required version
- The folder context menu is now also shown in the free space of the file list

#### Bugs fixed

- _Show more_ link in authorization history window now actually works
- Navigating to the clicked Stash link on application start has been fixed
- On multi-monitor setups, the window should no longer open on a disconnected screen
- Errors on push due to failed remote hooks are no longer ignored
- Invalid URLs in entries are now silently ignored
- Authorization changes in the 'Folder access' view are now correctly saved
- Display of long description values has been improved
- The passphrase input will no longer lose focus when new commits are received

## v1.2.0 (2018-12-14)

#### New features

- **Git history support**
  - The _Modified_ column is now based on git history instead of local file date
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

- The _My Favorites_ link and the tool icons now remain visible when scrolling
- The search scope is now highlighted when set to _current folder_
- UI scale now defaults to 15 for new installations

#### Bugs fixed

- Number settings fields no longer accept garbage input (and show a nice spinner as a bonus)
- The current selection is now remembered on reload / git update
- Git clone from SSH (using agent) no longer fails with _unsupported credentials type_ error
- Fixed _create item_ button being enabled before permissions have been initially set up (with warning message)
- Pushing the initial commit to an empty repository should now work
- The _uncommitted changes_ warning on quit should now work reliably

## v1.1.0 (2017-12-18)

This release adds some of the most requested features in v1.0.0 and fixes some bugs.

#### New features

- Folders can now be moved and merged by dragging the label onto another folder
- Added an edit icon in the breadcrumb bar for quick folder renaming
- A new 👁 icon in the folder tree allows you to hide inaccessible items (files and folders; off by default)
- When copying password data, the clipboard is now cleared after 30s
- New views on the _Users_ page allow a quick breakdown of user rights:
  - _Permissions_ lists all granted permissions for each user
  - _Access_ provides an editable map of access rights per folder
- The changelog is now included on the _Settings_ page

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
