# don't track me

A Safari Web Extension for macOS and iOS that strips or masks tracking parameters from every URL you visit.

Click an ad. Open a link from an email. Follow a "share" button. Sites quietly attach IDs like `fbclid`, `gclid`, `utm_source`, and `msclkid` to the URL so the ad network knows it was *you* who clicked. **don't track me** wipes those identifiers before the page even finishes loading, and before the URL gets passed along to anyone else.

Everything happens on your device. There is no account, no telemetry, no server.

## What it does

On the first run, the popup asks you to pick a mode:

- **Remove** — the cleanest option. Strips tracking parameters out of the URL entirely. Occasionally breaks affiliate links that abuse trackers as their primary key.
- **Mask** — keeps the parameter name but replaces its value with a random string. Less likely to break sites, still defeats the tracker.

After that, the extension silently cleans:

1. **The URL you land on** — rewritten in place via `history.replaceState`, so the URL bar never shows the trackers.
2. **Links you click** — `<a href>` is rewritten the instant you press a link, so the next page also stays clean.

Switch modes any time from the popup. Toggle the whole thing off with the switch. The popup shows a running counter of how many trackers have been neutralized.

## Tracked parameters

Around 50 known trackers across the major ad networks, including:

| Source | Parameters |
| --- | --- |
| Google Ads / Analytics | `gclid`, `gclsrc`, `dclid`, `gbraid`, `wbraid`, `gad_source`, `gclaw` |
| Meta / Facebook | `fbclid`, `fb_action_ids`, `fb_action_types`, `fb_ref`, `fb_source`, `fb_locale` |
| Microsoft / Bing | `msclkid` |
| TikTok | `ttclid` |
| Twitter / X | `twclid` |
| LinkedIn | `li_fat_id` |
| Yandex | `yclid`, `_openstat` |
| Mailchimp | `mc_eid`, `mc_cid` |
| HubSpot | `_hsenc`, `_hsmi`, `__hssc`, `__hstc`, `__hsfp`, `hsCtaTracking` |
| Instagram | `igshid`, `igsh` |
| Pinterest | `epik` |
| Snapchat | `sc_cid` |
| Klaviyo | `_ke` |
| Marketo / Adobe | `mkt_tok`, `s_kwcid` |
| Vero | `vero_id`, `vero_conv` |
| Oracle Eloqua | `oly_anon_id`, `oly_enc_id` |
| Branch | `_branch_match_id` |
| Wicked Reports | `wickedid` |
| Universal UTM | `utm_*` (all variants) |

The full list lives in `donttrackme/Shared (Extension)/Resources/content.js`.

## How it works

The extension is intentionally minimal:

- `content.js` runs at `document_start` on every page. It reads the current URL, removes or masks any known tracking parameters, and updates the URL bar without a reload. It also intercepts `mousedown` and `auxclick` events so links you're about to follow are cleaned in place.
- `popup.html`/`popup.js` provide the first-run mode picker, an on/off switch, the counter, and a way to swap modes.
- `background.js` is essentially empty — there's no service worker doing network interception. Cleaning happens in-page, which means no `webRequest` permission and a small permission footprint.
- State (`mode`, `enabled`, `cleaned` counter) is stored in `browser.storage.local`. Nothing leaves the device.

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Remember your chosen mode and the counter. |
| Host permission for all websites | The content script needs to read and rewrite URLs on any page you visit. |

That's it.

## Building

Requirements: macOS, Xcode 15 or later, an Apple Developer account if you want to install on a device.

```
git clone git@github.com:kiwi-init/donttrackme.git
cd donttrackme
open donttrackme.xcodeproj
```

In Xcode, pick the `donttrackme (macOS)` or `donttrackme (iOS)` scheme and hit Run. The first launch opens an onboarding window with instructions to enable the extension in Safari.

After enabling it in Safari → Settings → Extensions, **set the website permission to "Allow on Every Website"** — without this, the content script can't be injected and the extension does nothing.

## Project layout

```
donttrackme/
├── Shared (App)/              # The companion app that hosts the extension
│   └── Resources/             # Onboarding HTML/CSS shown on first launch
├── Shared (Extension)/        # The actual Safari Web Extension
│   ├── Resources/
│   │   ├── manifest.json      # MV3 manifest
│   │   ├── content.js         # The URL cleaner (the brain)
│   │   ├── background.js      # Minimal background page
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── SafariWebExtensionHandler.swift
├── iOS (App)/                 # iOS app target
├── iOS (Extension)/           # iOS extension target
├── macOS (App)/               # macOS app target
└── macOS (Extension)/         # macOS extension target
```

## Privacy

See [PRIVACY.md](PRIVACY.md). Short version: nothing leaves your device, ever.

## License

MIT.
