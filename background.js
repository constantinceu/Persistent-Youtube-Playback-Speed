// Ensure a default speed on first install
browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.get("playbackSpeed").then(data => {
        if (data.playbackSpeed === undefined) {
            browser.storage.local.set({ playbackSpeed: 1.0 });
        }
    });
});