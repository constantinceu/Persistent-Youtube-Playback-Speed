const speedInput = document.getElementById("speedInput");
const status = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");


// Load saved speed when options page opens
browser.storage.local.get("playbackSpeed").then(data => {
    if (data.playbackSpeed !== undefined) {
        speedInput.value = data.playbackSpeed;
    }
});


saveBtn.addEventListener("click", () => {
    const value = parseFloat(speedInput.value);
    if (!isNaN(value)) {
        browser.storage.local.set({ playbackSpeed: value }).then(() => {
            status.textContent = "Saved!";
            setTimeout(() => (status.textContent = ""), 1500);
        });
    }
});