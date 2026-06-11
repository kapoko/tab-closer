# Tab Closer

A Firefox extension that closes tabs after they have not been activated by the user for a configurable number of wall-clock hours. It closes overdue tabs on startup, giving you a clean browser session.

## Behavior

- Default timeout: 12 hours.
- The timer resets only when you activate/focus a tab.
- Background page activity, reloads, audio, title changes, and network activity do not reset the timer.
- Pinned tabs are never closed.
- Active tabs can be closed if they are overdue.
- Cleanup runs immediately when Firefox starts, so overdue restored tabs are removed during startup.
- Cleanup also runs every 5 minutes while Firefox is open.
- Last activation timestamps are stored on Firefox's tab session data, so restored tabs keep their original clock time where Firefox restores extension session data.
- Private browsing tabs are not handled unless the extension is manually allowed to run in private windows by Firefox.

## Settings

Open the extension options page to configure:

- `Close tabs after`: number of wall-clock hours since last activation.
- `Attempt to close tabs even if the page may show a close prompt`: enabled by default.

When prompt forcing is disabled, the extension skips tabs where it can detect filled form fields, editable content, or an inline `window.onbeforeunload` handler. Firefox does not expose every script-added close handler to extensions, so this protection is best-effort.

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

## Permissions

- `tabs`: read and close tabs, track tab activation.
- `storage`: store settings.
- `sessions`: keep last activation timestamps attached to restored tabs.
- `alarms`: run periodic cleanup.
- `<all_urls>`: inspect pages when the prompt-protection setting is disabled.
