browser.runtime.onInstalled.addListener((details) => {
    console.log("[donttrackme] installed:", details.reason);
});
