// Load saved speed from storage on each page
function applySpeedToAllVideos() {
    browser.storage.local.get("playbackSpeed").then(data => {
        const speed = data.playbackSpeed;

        if (speed === undefined) return;

        const videos = document.querySelectorAll("video");
        videos.forEach(v => {
            if (v.playbackRate !== speed) {
                v.playbackRate = speed;
            }
        });
    });
}

// Observe dynamically added videos (important for Twitter/X)
const observer = new MutationObserver(() => {
    applySpeedToAllVideos();
});

// Start observing the whole page
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Run immediately once
applySpeedToAllVideos();
