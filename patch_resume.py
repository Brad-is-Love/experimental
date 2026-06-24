import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# Update updateView to NOT re-run setup functions if the DOM already contains the game
content = content.replace(
"""    if (AppState.gameState === 'READING_STORY') {
        setupReadingScreen();
    }

    if (AppState.gameState === 'CHALLENGE_CLOZE') {
        setupClozeScreen();
    }

    if (AppState.gameState === 'CHALLENGE_COMPREHENSION') {
        setupComprehensionScreen();
    }

    if (AppState.gameState === 'CHALLENGE_SPEED_MATCH') {
        setupSpeedMatchScreen();
    }

    if (AppState.gameState === 'VICTORY') {
        setupVictoryScreen();
    }""",
"""    if (AppState.gameState === 'READING_STORY') {
        if (document.getElementById('story-paragraphs-container').innerHTML.trim() === '') {
            setupReadingScreen();
        }
    }

    if (AppState.gameState === 'CHALLENGE_CLOZE') {
        if (document.getElementById('cloze-story-paragraphs').innerHTML.trim() === '') {
            setupClozeScreen();
        }
    }

    if (AppState.gameState === 'CHALLENGE_COMPREHENSION') {
        if (document.getElementById('comp-options-container').innerHTML.trim() === '') {
            setupComprehensionScreen();
        }
    }

    if (AppState.gameState === 'CHALLENGE_SPEED_MATCH') {
        // speed match screen setup checks internally for active resume
        setupSpeedMatchScreen();
    }

    if (AppState.gameState === 'VICTORY') {
        setupVictoryScreen();
    }"""
)

# And make sure to clear the DOM when generating a *new* quest so the if statements above pass next time
content = content.replace(
"""// STORY GENERATOR CONSUMER
function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Reset active quest and session XP
    AppState.activeQuestState = null;
    AppState.gameSession.sessionXP = 0;""",
"""// STORY GENERATOR CONSUMER
function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Reset active quest and session XP
    AppState.activeQuestState = null;
    AppState.gameSession.sessionXP = 0;

    // Clear DOM state from any previous run
    document.getElementById('story-paragraphs-container').innerHTML = '';
    document.getElementById('cloze-story-paragraphs').innerHTML = '';
    document.getElementById('comp-options-container').innerHTML = '';
    document.getElementById('speed-match-grid').innerHTML = '';"""
)


with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
