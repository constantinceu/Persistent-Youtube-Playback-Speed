// contentScript.js

(function () {
    const LOG = false; // set true for console debug
    let currentTargetSpeed = null;

    function debug(...args) {
        if (LOG) console.log('[YT-SPEED-ENFORCER]', ...args);
    }

    // Ask background for effective speed (prefers storage, falls back to settings.json)
    function fetchEffectiveSpeed() {
        return browser.runtime.sendMessage({ type: 'GET_EFFECTIVE_SPEED' }).then(resp => {
            if (resp && typeof resp.speed === 'number') return resp.speed;
            return 1.0;
        }).catch(() => 1.0);
    }

    // Apply speed to a video element (and return true if changed/applied)
    function applySpeedToVideo(video, speed) {
        if (!video) return false;
        const prev = video.playbackRate;
        // Only set when different to avoid unnecessary churn
        if (Math.abs(prev - speed) > 1e-6) {
            try {
                video.playbackRate = speed;
                debug('Applied speed', speed, 'to', video);
                return true;
            } catch (e) {
                debug('Failed to set playbackRate', e);
            }
        }
        return false;
    }

    // Find the main YouTube <video> element(s)
    function findYouTubeVideos() {
        // YouTube uses <video> tags; there may be multiple but normally one is the player
        return Array.from(document.querySelectorAll('video'));
    }

    // Enforce speed on all videos
    function enforceSpeed(speed) {
        const videos = findYouTubeVideos();
        let changed = false;
        for (const v of videos) {
            if (applySpeedToVideo(v, speed)) changed = true;
        }
        return changed;
    }

    // Main procedure: fetch speed, set currentTargetSpeed, enforce persistently
    async function updateAndEnforce() {
        const speed = await fetchEffectiveSpeed();
        currentTargetSpeed = speed;
        debug('Enforce with speed', speed);
        enforceSpeed(speed);
    }

    // Listen for background broadcast telling us speed changed in storage, then reapply
    browser.runtime.onMessage.addListener((msg) => {
        if (msg && msg.type === 'YT_SPEED_UPDATED') {
            debug('Received YT_SPEED_UPDATED', msg.speed);
            currentTargetSpeed = msg.speed;
            enforceSpeed(msg.speed);
        }
    });

    // YouTube SPA navigation: listen to custom navigation event when available
    function addYouTubeNavigationListener() {
        // YouTube dispatches 'yt-navigate-finish' on document on navigation between videos (SPA).
        document.addEventListener('yt-navigate-finish', () => {
            debug('yt-navigate-finish fired');
            updateAndEnforce();
        }, true);

        // Also listen for history pushState/popState
        window.addEventListener('popstate', () => {
            debug('popstate fired');
            updateAndEnforce();
        }, true);
    }

    // MutationObserver: watch for video element insertions (for when player is recreated)
    function addVideoObserver() {
        const observer = new MutationObserver((mutations) => {
            let sawVideo = false;
            for (const m of mutations) {
                if (m.addedNodes) {
                    for (const n of m.addedNodes) {
                        if (n && (n.nodeName === 'VIDEO' || n.querySelector && n.querySelector('video'))) {
                            sawVideo = true;
                            break;
                        }
                    }
                }
                if (sawVideo) break;
            }
            if (sawVideo) {
                debug('New video node detected - reapplying speed');
                if (currentTargetSpeed === null) {
                    updateAndEnforce();
                } else {
                    enforceSpeed(currentTargetSpeed);
                }
            }
        });

        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }

    // Repeated enforcement: setInterval that enforces speed every 500ms as a last-resort to override page scripts.
    let enforcementInterval = null;
    function startPeriodicEnforce() {
        if (enforcementInterval) return;
        enforcementInterval = setInterval(() => {
            const speed = currentTargetSpeed;
            if (speed !== null) enforceSpeed(speed);
        }, 500); // every 500ms
    }

    // When the content script loads
    function init() {
        updateAndEnforce();
        addYouTubeNavigationListener();
        addVideoObserver();
        startPeriodicEnforce();

        // Also monitor for playbackRate property being changed by page scripts and immediately reset
        // We do this by setting an event on video when available
        document.addEventListener('ratechange', (e) => {
            const vid = e.target;
            if (vid && vid.tagName === 'VIDEO' && currentTargetSpeed !== null) {
                if (Math.abs(vid.playbackRate - currentTargetSpeed) > 1e-6) {
                    debug('Detected ratechange; reapplying target speed');
                    vid.playbackRate = currentTargetSpeed;
                }
            }
        }, true);
    }

    // Kick things off when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
