import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# Add logic to clear speedMatchInterval when pausing
content = content.replace(
"""function bindHeaderEvents() {
    document.getElementById('logo-btn').addEventListener('click', () => {
        if (AppState.gameState !== 'LANDING' && AppState.gameState !== 'LOADING_STORY') {
            if (confirm("Return to the Tavern? You can resume your Quest later.")) {
                AppState.activeQuestState = AppState.gameState;
                setGameState('LANDING');""",
"""function bindHeaderEvents() {
    document.getElementById('logo-btn').addEventListener('click', () => {
        if (AppState.gameState !== 'LANDING' && AppState.gameState !== 'LOADING_STORY') {
            if (confirm("Return to the Tavern? You can resume your Quest later.")) {
                if (AppState.gameSession.speedMatchInterval) {
                    clearInterval(AppState.gameSession.speedMatchInterval);
                    AppState.gameSession.speedMatchInterval = null;
                }
                AppState.activeQuestState = AppState.gameState;
                setGameState('LANDING');"""
)

with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
