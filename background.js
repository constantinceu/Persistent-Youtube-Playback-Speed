// background.js

// When the stored speed changes, notify all youtube tabs so content scripts can reapply immediately.
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.ytSpeed) {
        const newVal = changes.ytSpeed.newValue;
        // Broadcast to all tabs (content script will filter by host)
        browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                // send message - content script can ignore if not YouTube page
                browser.tabs.sendMessage(tab.id, { type: 'YT_SPEED_UPDATED', speed: newVal }).catch(() => { });
            }
        });
    }
});

// Helper: return the stored speed (resolves to number or null)
function getStoredSpeed() {
    return browser.storage.local.get('ytSpeed').then(res => {
        if (res && typeof res.ytSpeed === 'number') return res.ytSpeed;
        return null;
    });
}

// Provide message API for content scripts to request the effective speed (storage -> fallback settings.json)
browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg && msg.type === 'GET_EFFECTIVE_SPEED') {
        // Try storage first
        return getStoredSpeed().then(stored => {
            if (stored !== null) return { speed: stored, source: 'storage' };
            // If none in storage, read settings.json (packaged default)
            return fetch(browser.runtime.getURL('settings.json'))
                .then(r => r.json())
                .then(j => {
                    const s = Number(j.defaultSpeed);
                    return { speed: isNaN(s) ? 1.0 : s, source: 'settings.json' };
                })
                .catch(() => ({ speed: 1.0, source: 'fallback' }));
        });
    }
});
