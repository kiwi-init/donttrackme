# Privacy Policy

**Effective date:** 2026-06-09

**don't track me** is a Safari Web Extension that strips or masks tracking parameters from URLs. This document explains what data the extension touches, where it goes, and what it is used for.

## What the extension processes

To do its job, the extension reads URLs of pages you visit and of links you interact with, so it can identify and remove or scramble tracking parameters such as `fbclid`, `gclid`, `utm_*`, and similar.

## What the extension stores

The extension stores three values in your browser's local extension storage on your device:

- **Mode** — your choice between *Remove* and *Mask*.
- **Enabled** — whether the extension is currently active.
- **Counter** — how many tracking parameters have been neutralized.

This data never leaves your device.

## What the extension does **not** do

- Does not collect, transmit, or sell any data.
- Does not contact any server.
- Does not use analytics, telemetry, or crash reporting.
- Does not require an account or sign-in.
- Does not read page content beyond URLs.
- Does not track you across sites.

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Persist your mode preference and the counter on your device. |
| Access to all websites | Required so the content script can read and rewrite URLs on any site you visit. |

## Third parties

There are none. No SDKs, no analytics frameworks, no advertising integrations.

## Children's privacy

The extension does not collect any personal information from anyone, including children.

## Changes to this policy

If this policy ever changes, the new version will be committed to this repository and the effective date above will be updated.

## Contact

For questions, open an issue at <https://github.com/kiwi-init/donttrackme/issues>.
