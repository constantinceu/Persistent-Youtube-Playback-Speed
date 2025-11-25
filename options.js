// options.js

document.addEventListener('DOMContentLoaded', () => {
    const speedInput = document.getElementById('speedInput');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const effectiveSpan = document.getElementById('effectiveSpeed');

    function showEffectiveSpeed() {
        // Ask background for effective speed
        browser.runtime.sendMessage({ type: 'GET_EFFECTIVE_SPEED' }).then(resp => {
            effectiveSpan.textContent = resp && typeof resp.speed === 'number' ? `${resp.speed} (source: ${resp.source})` : '1.0';
        }).catch(() => {
            effectiveSpan.textContent = '1.0 (error)';
        });
    }

    // Load stored value into input if present
    browser.storage.local.get('ytSpeed').then(res => {
        if (res && typeof res.ytSpeed === 'number') {
            speedInput.value = res.ytSpeed;
        } else {
            speedInput.value = '';
        }
        showEffectiveSpeed();
    });

    saveBtn.addEventListener('click', () => {
        const v = parseFloat(speedInput.value);
        if (isNaN(v) || v <= 0) {
            alert('Please enter a valid positive number for the speed.');
            return;
        }
        browser.storage.local.set({ ytSpeed: v }).then(() => {
            showEffectiveSpeed();
            // notify (background will broadcast, but notify explicitly too)
            browser.runtime.sendMessage({ type: 'YT_SPEED_UPDATED', speed: v }).catch(() => { });
        });
    });

    clearBtn.addEventListener('click', () => {
        browser.storage.local.remove('ytSpeed').then(() => {
            showEffectiveSpeed();
        });
    });
});
