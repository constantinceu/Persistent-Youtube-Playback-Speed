function applySpeed(speed) {
    const video = document.querySelector("video");
    if (video) {
        video.playbackRate = speed;
    }
}


// Observe dynamic page changes (YouTube navigation)
const observer = new MutationObserver(() => {
    browser.storage.local.get("playbackSpeed").then(data => {
        if (data.playbackSpeed !== undefined) {
            applySpeed(data.playbackSpeed);
        }
    });
});


observer.observe(document.body, { childList: true, subtree: true });


// Apply instantly on load
browser.storage.local.get("playbackSpeed").then(data => {
    if (data.playbackSpeed !== undefined) {
        applySpeed(data.playbackSpeed);
    }
});