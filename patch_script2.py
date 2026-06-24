import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# Add real-time XP function
content = content.replace(
"""// Global Application State""",
"""function addRealTimeXP(amount) {
    if (!amount) return;
    AppState.stats.xp += amount;
    AppState.gameSession.sessionXP = (AppState.gameSession.sessionXP || 0) + amount;

    // Check level up threshold
    const targetXP = AppState.stats.level * 150;
    if (AppState.stats.xp >= targetXP) {
        AppState.stats.xp -= targetXP;
        AppState.stats.level++;
        syncHeaderStats();
        // Delay trigger of celebration so it doesn't interrupt flow
        setTimeout(() => triggerLevelUpModal(AppState.stats.level), 1500);
    } else {
        syncHeaderStats();
    }
    saveCurrentState();
}

// Global Application State"""
)

# Cloze Rift real-time XP
content = content.replace(
"""        // Sound and Floating text juice
        LingoAudio.playCorrect();
        spawnFloatingText(zoneEl, "+10 XP", 'xp');""",
"""        // Sound and Floating text juice
        LingoAudio.playCorrect();
        spawnFloatingText(zoneEl, "+10 XP", 'xp');
        addRealTimeXP(10);"""
)

# Comprehension real-time XP
content = content.replace(
"""    if (isCorrect) {
        AppState.gameSession.compCorrectCount++;
        LingoAudio.playCorrect();
        spawnFloatingText(cardEl, "+10 XP", 'xp');""",
"""    if (isCorrect) {
        AppState.gameSession.compCorrectCount++;
        LingoAudio.playCorrect();
        spawnFloatingText(cardEl, "+10 XP", 'xp');
        addRealTimeXP(10);"""
)

# Comprehension completion bonus + Story read bonus
content = content.replace(
"""        // Check complete
        const totalToSolve = Object.keys(AppState.gameSession.clozeMatches).length;
        if (AppState.gameSession.clozeCorrectCount >= totalToSolve) {
            triggerClozeRiftCompletion();
        }""",
"""        // Check complete
        const totalToSolve = Object.keys(AppState.gameSession.clozeMatches).length;
        if (AppState.gameSession.clozeCorrectCount >= totalToSolve) {
            // Apply reading completion bonus and rift completion bonus
            if (!AppState.gameSession.storyReadAwarded) {
                 addRealTimeXP(20); // Story read base
                 AppState.gameSession.storyReadAwarded = true;
            }
            triggerClozeRiftCompletion();
        }"""
)

# Comprehension perfect score bonus
content = content.replace(
"""    document.getElementById('btn-next-question').addEventListener('click', () => {
        AppState.gameSession.compCurrentQuestion++;
        if (AppState.gameSession.compCurrentQuestion < 3) {
            renderComprehensionQuestion();
        } else {
            setGameState('CHALLENGE_SPEED_MATCH');
        }
    });""",
"""    document.getElementById('btn-next-question').addEventListener('click', () => {
        AppState.gameSession.compCurrentQuestion++;
        if (AppState.gameSession.compCurrentQuestion < 3) {
            renderComprehensionQuestion();
        } else {
            if (AppState.gameSession.compCorrectCount === 3 && !AppState.gameSession.compPerfectAwarded) {
                addRealTimeXP(15);
                AppState.gameSession.compPerfectAwarded = true;
            }
            setGameState('CHALLENGE_SPEED_MATCH');
        }
    });"""
)

# Speed Match Bonus
content = content.replace(
"""            // Check completed
            if (AppState.gameSession.speedMatchedCount >= 6) {
                clearInterval(AppState.gameSession.speedMatchInterval);
                // Pause briefly before victory screen
                setTimeout(() => {
                    setGameState('VICTORY');
                }, 600);
            }""",
"""            // Check completed
            if (AppState.gameSession.speedMatchedCount >= 6) {
                clearInterval(AppState.gameSession.speedMatchInterval);

                const speedTime = 20.0 - AppState.gameSession.speedMatchTimer;
                let speedBonus = 20; // base speed match clear
                if (speedTime <= 10.0) speedBonus += 10;
                addRealTimeXP(speedBonus);

                // Pause briefly before victory screen
                setTimeout(() => {
                    setGameState('VICTORY');
                }, 600);
            }"""
)

# Victory calculation refactoring
content = content.replace(
"""function setupVictoryScreen() {
    // Generate XP Details
    const clozeXP = 30;
    const compScore = AppState.gameSession.compCorrectCount;
    const compXP = compScore * 10 + (compScore === 3 ? 15 : 0); // 10 per q, +15 perfect

    const speedTime = 20.0 - AppState.gameSession.speedMatchTimer;
    const speedXP = 20 + (speedTime <= 10.0 ? 10 : 0); // 20 standard, +10 speed bonus
    const totalXP = 20 + clozeXP + compXP + speedXP; // Story read: 20
    const totalCoins = 15;

    // Update labels
    document.getElementById('victory-quest-summary').textContent = `${AppState.config.genre} Quest solved!`;
    document.getElementById('victory-xp-cloze').textContent = `+${clozeXP} XP`;
    document.getElementById('victory-xp-comp').textContent = `+${compXP} XP (${compScore}/3 correct)`;
    document.getElementById('victory-xp-speed').textContent = `+${speedXP} XP (${speedTime.toFixed(1)}s elapsed)`;
    document.getElementById('victory-total-xp').textContent = `+${totalXP} XP`;
    document.getElementById('victory-total-coins').textContent = `+${totalCoins} Coins`;""",
"""function setupVictoryScreen() {
    // Generate XP Details
    const clozeScore = AppState.gameSession.clozeCorrectCount;
    const clozeXP = clozeScore * 10;
    const compScore = AppState.gameSession.compCorrectCount;
    const compXP = compScore * 10 + (compScore === 3 ? 15 : 0); // 10 per q, +15 perfect

    const speedTime = 20.0 - AppState.gameSession.speedMatchTimer;
    const speedXP = 20 + (speedTime <= 10.0 ? 10 : 0); // 20 standard, +10 speed bonus

    // Total XP in this session was already added real-time, just summarizing here
    const totalXP = AppState.gameSession.sessionXP || (20 + clozeXP + compXP + speedXP);
    const totalCoins = 15;

    // Update labels
    document.getElementById('victory-quest-summary').textContent = `${AppState.config.genre} Quest solved!`;
    document.getElementById('victory-xp-cloze').textContent = `+${clozeXP} XP`;
    document.getElementById('victory-xp-comp').textContent = `+${compXP} XP (${compScore}/3 correct)`;
    document.getElementById('victory-xp-speed').textContent = `+${speedXP} XP (${speedTime.toFixed(1)}s elapsed)`;
    document.getElementById('victory-total-xp').textContent = `+${totalXP} XP`;
    document.getElementById('victory-total-coins').textContent = `+${totalCoins} Coins`;"""
)

# Remove the batch totalXP addition from the Victory screen to prevent double counting
content = content.replace(
"""    // Apply gains and check for Level Up
    const oldLevel = AppState.stats.level;
    let oldXP = AppState.stats.xp;

    AppState.stats.xp += totalXP;
    AppState.stats.coins += totalCoins;""",
"""    // Apply gains and check for Level Up
    const oldLevel = AppState.stats.level;
    let oldXP = AppState.stats.xp;

    // Note: XP was already added via addRealTimeXP, so we don't add totalXP again here.
    // We do need to add the coins which weren't added real-time.
    AppState.stats.coins += totalCoins;"""
)

with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
