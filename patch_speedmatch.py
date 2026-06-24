import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# Fix Speed Match softlock
content = content.replace(
"""function setupSpeedMatchScreen() {
    const grid = document.getElementById('speed-match-grid');
    grid.innerHTML = '';

    // Reset vars
    AppState.gameSession.speedMatchTimer = 20.0;
    AppState.gameSession.speedSelectedCard = null;
    AppState.gameSession.speedMatchedCount = 0;

    const timerContainer = document.querySelector('.speed-match-timer-container');
    if (timerContainer) {
        timerContainer.classList.remove('warning-pulse');
    }

    // Select 6 words from round
    const pool = AppState.story.vocabUsed.slice(0, 6);

    // Create 12 card elements (6 fronts, 6 backs)
    const cards = [];
    pool.forEach(item => {
        cards.push({ id: item.id, text: item.front, type: 'front' });
        cards.push({ id: item.id, text: item.back, type: 'back' });
    });""",
"""function setupSpeedMatchScreen() {
    // If returning from pause, the grid might already have the game running.
    // So we only set up if it's not already initialized.
    const grid = document.getElementById('speed-match-grid');
    if (grid.innerHTML.trim() !== '' && AppState.gameSession.speedMatchTimer > 0) {
        // Resume timer if it was paused
        if (!AppState.gameSession.speedMatchInterval) {
            startSpeedMatchTimer();
        }
        return;
    }
    grid.innerHTML = '';

    // Reset vars
    AppState.gameSession.speedMatchTimer = 20.0;
    AppState.gameSession.speedSelectedCard = null;
    AppState.gameSession.speedMatchedCount = 0;

    const timerContainer = document.querySelector('.speed-match-timer-container');
    if (timerContainer) {
        timerContainer.classList.remove('warning-pulse');
    }

    // Select up to 6 words from round
    const pool = AppState.story.vocabUsed.slice(0, 6);
    AppState.gameSession.speedMatchTotalPairs = pool.length; // Save dynamically

    // Create card elements
    const cards = [];
    pool.forEach(item => {
        cards.push({ id: item.id, text: item.front, type: 'front' });
        cards.push({ id: item.id, text: item.back, type: 'back' });
    });"""
)

content = content.replace(
"""            // Check completed
            if (AppState.gameSession.speedMatchedCount >= 6) {""",
"""            // Check completed
            if (AppState.gameSession.speedMatchedCount >= AppState.gameSession.speedMatchTotalPairs) {"""
)

# Extract timer into startSpeedMatchTimer
content = content.replace(
"""    // Launch countdown timer
    updateSpeedMatchTimerUI();

    if (AppState.gameSession.speedMatchInterval) {
        clearInterval(AppState.gameSession.speedMatchInterval);
    }

    AppState.gameSession.speedMatchInterval = setInterval(() => {
        AppState.gameSession.speedMatchTimer -= 0.1;

        // Visual and auditory warning juice under 5 seconds
        if (AppState.gameSession.speedMatchTimer <= 5.0) {
            const container = document.querySelector('.speed-match-timer-container');
            if (container) {
                container.classList.add('warning-pulse');
            }
            const ms = Math.round(AppState.gameSession.speedMatchTimer * 10) % 10;
            if (ms === 0 && AppState.gameSession.speedMatchTimer > 0) {
                LingoAudio.playTick();
            }
        }

        if (AppState.gameSession.speedMatchTimer <= 0) {
            AppState.gameSession.speedMatchTimer = 0;
            clearInterval(AppState.gameSession.speedMatchInterval);
            triggerSpeedMatchFailure();
        }
        updateSpeedMatchTimerUI();
    }, 100);
}""",
"""    // Launch countdown timer
    updateSpeedMatchTimerUI();
    startSpeedMatchTimer();
}

function startSpeedMatchTimer() {
    if (AppState.gameSession.speedMatchInterval) {
        clearInterval(AppState.gameSession.speedMatchInterval);
    }

    AppState.gameSession.speedMatchInterval = setInterval(() => {
        AppState.gameSession.speedMatchTimer -= 0.1;

        // Visual and auditory warning juice under 5 seconds
        if (AppState.gameSession.speedMatchTimer <= 5.0) {
            const container = document.querySelector('.speed-match-timer-container');
            if (container) {
                container.classList.add('warning-pulse');
            }
            const ms = Math.round(AppState.gameSession.speedMatchTimer * 10) % 10;
            if (ms === 0 && AppState.gameSession.speedMatchTimer > 0) {
                LingoAudio.playTick();
            }
        }

        if (AppState.gameSession.speedMatchTimer <= 0) {
            AppState.gameSession.speedMatchTimer = 0;
            clearInterval(AppState.gameSession.speedMatchInterval);
            AppState.gameSession.speedMatchInterval = null;
            triggerSpeedMatchFailure();
        }
        updateSpeedMatchTimerUI();
    }, 100);
}"""
)


with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
