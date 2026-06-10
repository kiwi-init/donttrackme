const TRACKING_PARAMS = new Set([
    "gclid", "gclsrc", "dclid", "gbraid", "wbraid", "gad_source", "gad", "gclaw",
    "fbclid", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source", "fb_locale", "_fb",
    "msclkid",
    "ttclid",
    "twclid",
    "li_fat_id",
    "yclid", "_openstat",
    "mc_eid", "mc_cid",
    "_hsenc", "_hsmi", "__hssc", "__hstc", "__hsfp", "hsCtaTracking",
    "igshid", "igsh",
    "epik",
    "sc_cid",
    "_ke",
    "mkt_tok", "s_kwcid",
    "vero_id", "vero_conv",
    "oly_anon_id", "oly_enc_id",
    "_branch_match_id",
    "wickedid",
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "utm_id", "utm_name", "utm_referrer", "utm_creative_format",
    "utm_marketing_tactic", "utm_source_platform"
]);

// Match case-insensitively: query-param keys are case-sensitive per spec, but a
// tracker like GCLID is the same tracker as gclid. Normalize both sides so an
// uppercase/mixed-case variant (e.g. the camelCase hsCtaTracking) still matches.
const TRACKING_PARAMS_LC = new Set();
for (const p of TRACKING_PARAMS) TRACKING_PARAMS_LC.add(p.toLowerCase());

function isTrackingKey(key) {
    const k = key.toLowerCase();
    return TRACKING_PARAMS_LC.has(k) || k.startsWith("utm_");
}

function randomToken(len) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

function cleanUrl(urlStr, mode) {
    let url;
    try {
        url = new URL(urlStr);
    } catch {
        return null;
    }
    if (!url.search) return null;

    const params = url.searchParams;
    const matched = [];
    for (const key of params.keys()) {
        if (isTrackingKey(key)) matched.push(key);
    }
    if (matched.length === 0) return null;

    if (mode === "remove") {
        for (const key of matched) params.delete(key);
    } else if (mode === "mask") {
        for (const key of matched) {
            const original = params.get(key) ?? "";
            const targetLen = Math.max(8, Math.min(32, original.length || 16));
            params.set(key, randomToken(targetLen));
        }
    } else {
        return null;
    }

    return { url: url.toString(), count: matched.length };
}

let currentMode = null;
let currentEnabled = true;
let incrementQueue = 0;
let incrementFlushTimer = null;

async function flushIncrement() {
    const inc = incrementQueue;
    incrementQueue = 0;
    incrementFlushTimer = null;
    if (inc <= 0) return;
    try {
        const result = await browser.storage.local.get(["cleaned"]);
        const current = typeof result.cleaned === "number" ? result.cleaned : 0;
        await browser.storage.local.set({ cleaned: current + inc });
    } catch (e) {
        console.warn("[donttrackme] increment failed:", e);
    }
}

function bumpCleaned(count) {
    incrementQueue += count;
    if (incrementFlushTimer) return;
    incrementFlushTimer = setTimeout(flushIncrement, 200);
}

function applyCleanToLocation() {
    if (!currentEnabled || !currentMode) return;
    const result = cleanUrl(location.href, currentMode);
    if (result && result.url !== location.href) {
        try {
            history.replaceState(history.state, "", result.url);
            bumpCleaned(result.count);
        } catch (e) {
            console.warn("[donttrackme] replaceState failed:", e);
        }
    }
}

function cleanLink(anchor) {
    if (!anchor || !anchor.href) return;
    if (!currentEnabled || !currentMode) return;
    const result = cleanUrl(anchor.href, currentMode);
    if (result && result.url !== anchor.href) {
        anchor.href = result.url;
        bumpCleaned(result.count);
    }
}

document.addEventListener("mousedown", (e) => {
    const anchor = e.target.closest?.("a[href]");
    if (anchor) cleanLink(anchor);
}, true);

document.addEventListener("auxclick", (e) => {
    const anchor = e.target.closest?.("a[href]");
    if (anchor) cleanLink(anchor);
}, true);

// Keyboard activation (Tab-to-focus + Enter) dispatches click/navigation without
// firing mousedown or auxclick, so without this the dirty href would be requested
// from the destination server. Capture phase runs before the default navigation.
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const anchor = e.target.closest?.("a[href]");
    if (anchor) cleanLink(anchor);
}, true);

(async () => {
    try {
        const state = await browser.storage.local.get(["mode", "enabled"]);
        currentMode = state.mode ?? null;
        currentEnabled = state.enabled !== false;
        applyCleanToLocation();
    } catch (e) {
        console.warn("[donttrackme] content init failed:", e);
    }
})();

browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    let configChanged = false;
    if (changes.mode) {
        currentMode = changes.mode.newValue ?? null;
        configChanged = true;
    }
    if (changes.enabled) {
        currentEnabled = changes.enabled.newValue !== false;
        configChanged = true;
    }
    if (configChanged) applyCleanToLocation();
});
