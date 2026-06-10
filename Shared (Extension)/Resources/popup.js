const setupView = document.getElementById("setup");
const mainView = document.getElementById("main");
const enabledToggle = document.getElementById("enabled-toggle");
const cleanedCount = document.getElementById("cleaned-count");
const statusLine = document.getElementById("status-line");
const segRemove = document.getElementById("seg-remove");
const segMask = document.getElementById("seg-mask");

function render(state) {
    const mode = state.mode ?? null;
    const enabled = state.enabled !== false;
    const cleaned = state.cleaned ?? 0;

    if (!mode) {
        setupView.hidden = false;
        mainView.hidden = true;
        return;
    }

    setupView.hidden = true;
    mainView.hidden = false;
    enabledToggle.checked = enabled;
    cleanedCount.textContent = String(cleaned);
    segRemove.classList.toggle("active", mode === "remove");
    segMask.classList.toggle("active", mode === "mask");

    if (!enabled) {
        statusLine.textContent = "Paused. Trackers will pass through until re-enabled.";
    } else if (mode === "remove") {
        statusLine.textContent = "Removing tracking parameters from every request.";
    } else {
        statusLine.textContent = "Masking tracking parameters with random values.";
    }
}

async function readState() {
    return await browser.storage.local.get(["mode", "enabled", "cleaned"]);
}

(async () => {
    render(await readState());
})();

browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") {
        render(await readState());
    }
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        await browser.storage.local.set({ mode: btn.dataset.mode, enabled: true });
    });
});

[segRemove, segMask].forEach((btn) => {
    btn.addEventListener("click", async () => {
        await browser.storage.local.set({ mode: btn.dataset.mode });
    });
});

enabledToggle.addEventListener("change", async () => {
    await browser.storage.local.set({ enabled: enabledToggle.checked });
});
