import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# Make sure to reset sessionXP in triggerQuestGeneration
content = content.replace(
"""// STORY GENERATOR CONSUMER
function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Reset active quest
    AppState.activeQuestState = null;""",
"""// STORY GENERATOR CONSUMER
function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Reset active quest and session XP
    AppState.activeQuestState = null;
    AppState.gameSession.sessionXP = 0;"""
)

with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
