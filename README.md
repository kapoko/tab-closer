# Tab Closer

Arc-style tab closing for Firefox. Closes tabs that have not been activated for a configurable number of hours wall-clock hours, even after the browser has been closed.

## Behavior

- Default timeout: 12 hours.
- The timer resets only when you activate/focus a tab.
- Background page activity, reloads, audio, title changes, and network activity do not reset the timer.
- Pinned tabs are never closed.
- Active tabs can be closed if they are overdue.
- Tabs with unsaved form data can be closed if they are overdue.
- Cleanup runs immediately when Firefox starts, so overdue restored tabs are removed during startup.
- Cleanup also runs every 5 minutes while Firefox is open.
- Last activation timestamps are stored on Firefox's tab session data, so restored tabs keep their original clock time where Firefox restores extension session data.
- Private browsing tabs are not handled unless the extension is manually allowed to run in private windows by Firefox.
- Firefox for Android is not supported because it does not support the tab session storage API this extension uses.

## Settings

Open the extension options page to configure:

- `Close tabs after`: number of wall-clock hours since last activation.

## Popup

The toolbar popup shows:

- Current timeout.
- Number of open tabs.
- Number of tracked tabs.
- Number of overdue closable tabs.
- A `Close all unpinned tabs now` button that marks unpinned tabs overdue and immediately runs cleanup.

## Temporary Installation

1. Open Firefox.
2. Go to `about:debugging#/runtime/this-firefox`.
3. Click `Load Temporary Add-on...`.
4. Select `manifest.json` from this directory.

Temporary add-ons are removed when Firefox restarts. Package and sign the extension through Mozilla Add-ons for permanent installation.

## Release Automation

GitHub Actions packages and signs the extension when you push a version tag like `v1.0.0`, or when you run the workflow manually from GitHub's Actions tab.

Required repository secrets:

- `AMO_JWT_ISSUER`: Mozilla Add-ons API JWT issuer.
- `AMO_JWT_SECRET`: Mozilla Add-ons API JWT secret.

The workflow uploads two artifacts:

- An unsigned `.zip` package.
- A signed `.xpi` from Mozilla Add-ons.

## Permissions

- `tabs`: read and close tabs, track tab activation.
- `storage`: store settings.
- `sessions`: keep last activation timestamps attached to restored tabs.
- `alarms`: run periodic cleanup.

## Compatibility

- Firefox desktop 140.0 or newer.

## Data Collection

This extension does not collect or transmit user data outside Firefox. Its AMO manifest declares `data_collection_permissions.required` as `none`.
