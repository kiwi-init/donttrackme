# SPLUS.md — how this repo wants to be reviewed

**don't track me** is a privacy-first Safari Web Extension (iOS + macOS) that strips
or masks URL tracking parameters. Everything runs on-device: no server, no account,
no telemetry. The whole product is "your identity doesn't leak" — review through
that lens.

## policy
- signal budget: keep it tight; lead with the worst thing.
- max scrutiny — anything that breaks the privacy promise:
  - a tracker left in place, or a cleaning path that silently no-ops
    (`isTrackingKey`, `cleanUrl`, the `mousedown`/`auxclick` link handlers).
  - the original (uncleaned) URL or any identifier leaving the device — network
    calls, beacons, third-party requests. There should be **zero**. Flag any.
  - `manifest.json` permission surface: it ships `host_permissions: <all_urls>` +
    `storage` only. Any new permission, host, or `<all_urls>` widening is must-flag.
- hotspot: `Shared (Extension)/Resources/content.js` is the core. It runs on
  `<all_urls>`, `document_start`, `all_frames`. Bugs here hit every page.

## nits & conventions
- No server, no telemetry by design. Do **not** suggest adding analytics, error
  reporting, or "send failures to a logging service" — proposing that is the bug.
  If anything phones home, flag the opposite: that it exists at all.
- `Math.random()` in `randomToken` (mask mode) is intentional and NOT a security
  primitive — it produces plausible junk to defeat a tracker, not a secret. Don't
  flag it as "insecure randomness / use crypto.getRandomValues".
- The `cleaned` counter (`bumpCleaned` → debounced `flushIncrement`, get-then-set on
  `storage.local`) is best-effort and cosmetic. A minor undercount or cross-frame
  race is acceptable — don't raise it as must-fix.
- `console.*` breadcrumbs are prefixed `[donttrackme]` and intentional for debug —
  but `content cleaned: <url>` (content.js) logs the user's URL into every page's
  console on each navigation. That one is fair to flag on privacy grounds; treat
  the rest as low-priority nits.
- `Shared (Extension)/SafariWebExtensionHandler.swift` is Apple's stock echo
  template, not on the cleaning path. Don't over-review boilerplate.
- No test harness exists. Absence of tests is known — raise it as a concern at most,
  never a must-fix.

## skip
- skip: donttrackme.xcodeproj/**    <!-- Xcode-managed project/build config -->
- skip: **/*.storyboard             <!-- Interface Builder XML, no logic -->
- skip: **/*.xcassets/**            <!-- asset catalogs -->
- skip: **/Info.plist              <!-- declarative bundle config (manifest.json stays in scope) -->
- skip: **/_locales/**             <!-- i18n message bundles -->

## voice
terse. no praise padding. file:line and a concrete fix, or don't raise it.
