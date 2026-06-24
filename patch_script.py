import re

with open('language_tool/static/index.js', 'r') as f:
    content = f.read()

# 1. Update activeQuestState and config
content = content.replace(
"""    // Current Active Screen (LANDING, LOADING_STORY, READING_STORY, CHALLENGE_CLOZE, CHALLENGE_COMPREHENSION, CHALLENGE_SPEED_MATCH, VICTORY)
    gameState: 'LANDING',

    // Selected settings
    config: {
        genre: 'Daily Life',
        difficulty: 'Novice'
    },""",
"""    // Current Active Screen (LANDING, LOADING_STORY, READING_STORY, CHALLENGE_CLOZE, CHALLENGE_COMPREHENSION, CHALLENGE_SPEED_MATCH, VICTORY)
    gameState: 'LANDING',

    // Resume tracking
    activeQuestState: null,

    // Selected settings
    config: {
        genre: 'Daily Life',
        languageLevel: ''
    },"""
)

# 2. Replace diff buttons logic with language input logic
content = content.replace(
"""    // Difficulty select control
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.config.difficulty = btn.dataset.difficulty;
        });
    });""",
"""    // Target Language text input
    const langInput = document.getElementById('target-language-level');
    if (langInput) {
        langInput.addEventListener('input', (e) => {
            AppState.config.languageLevel = e.target.value;
            // Optionally enable the generate button if a deck is also loaded
            if (AppState.vocabulary.length > 0 && e.target.value.trim() !== '') {
                document.getElementById('btn-generate-quest').removeAttribute('disabled');
            } else if (AppState.vocabulary.length === 0) {
                document.getElementById('btn-generate-quest').setAttribute('disabled', 'true');
            }
        });
    }"""
)

# 3. Add resume quest button event listener
content = content.replace(
"""    // Generate Quest CTA
    document.getElementById('btn-generate-quest').addEventListener('click', () => {
        if (AppState.vocabulary.length === 0) return;
        triggerQuestGeneration();
    });
}""",
"""    // Generate Quest CTA
    document.getElementById('btn-generate-quest').addEventListener('click', () => {
        if (AppState.vocabulary.length === 0) return;
        triggerQuestGeneration();
    });

    // Resume Quest CTA
    const resumeBtn = document.getElementById('btn-resume-quest');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (AppState.activeQuestState) {
                setGameState(AppState.activeQuestState);
            }
        });
    }
}"""
)

# 4. Modify header event to save quest state
content = content.replace(
"""function bindHeaderEvents() {
    document.getElementById('logo-btn').addEventListener('click', () => {
        if (AppState.gameState !== 'LANDING' && AppState.gameState !== 'LOADING_STORY') {
            if (confirm("Are you sure you want to return to the Tavern? Your current Quest progress will be lost.")) {
                // Clear any running timers
                if (AppState.gameSession.speedMatchInterval) {
                    clearInterval(AppState.gameSession.speedMatchInterval);
                }
                setGameState('LANDING');
            }
        }
    });
}""",
"""function bindHeaderEvents() {
    document.getElementById('logo-btn').addEventListener('click', () => {
        if (AppState.gameState !== 'LANDING' && AppState.gameState !== 'LOADING_STORY') {
            if (confirm("Return to the Tavern? You can resume your Quest later.")) {
                AppState.activeQuestState = AppState.gameState;
                setGameState('LANDING');

                // Show Resume button
                const resumeBtn = document.getElementById('btn-resume-quest');
                if (resumeBtn) resumeBtn.style.display = 'inline-flex';
                // Update generate button text
                const genBtn = document.getElementById('btn-generate-quest');
                if (genBtn) genBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> New Quest';
            }
        }
    });
}"""
)

# 5. Modify quest generation
content = content.replace(
"""function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Choose 12 cards to send to generator
    const selectedVocab = AppState.vocabulary.sort(() => 0.5 - Math.random()).slice(0, 12);

    const payload = {
        genre: AppState.config.genre,
        difficulty: AppState.config.difficulty,
        vocabulary: selectedVocab,
        apiKey: AppState.apiKey
    };""",
"""function triggerQuestGeneration() {
    setGameState('LOADING_STORY');

    // Reset active quest
    AppState.activeQuestState = null;
    const resumeBtn = document.getElementById('btn-resume-quest');
    if (resumeBtn) resumeBtn.style.display = 'none';

    // Set level if empty
    const langInput = document.getElementById('target-language-level');
    const levelVal = langInput ? langInput.value : '';
    const finalLevel = levelVal.trim() !== '' ? levelVal : 'Intermediate';

    // Choose 12 cards to send to generator
    const selectedVocab = AppState.vocabulary.sort(() => 0.5 - Math.random()).slice(0, 12);

    const payload = {
        genre: AppState.config.genre,
        languageLevel: finalLevel,
        vocabulary: selectedVocab,
        apiKey: AppState.apiKey
    };"""
)

# 6. Extract actual words from generated html
content = content.replace(
"""        if (data.status === 'success') {
            AppState.story.paragraphs = data.paragraphs;
            AppState.story.questions = data.questions;
            AppState.story.vocabUsed = selectedVocab; // Cache vocab items active in this round
            setGameState('READING_STORY');
        } else {""",
"""        if (data.status === 'success') {
            AppState.story.paragraphs = data.paragraphs;
            AppState.story.questions = data.questions;
            // The LLM may have chosen only a subset (up to 7) of the 12 words
            // We need to extract the actual words used from the generated HTML
            const usedIds = new Set();
            data.paragraphs.forEach(p => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = p;
                tempDiv.querySelectorAll('vocab').forEach(v => usedIds.add(v.getAttribute('id')));
            });

            AppState.story.vocabUsed = selectedVocab.filter(v => usedIds.has(v.id));

            setGameState('READING_STORY');
        } else {"""
)

# 7. Update reading screen badges
content = content.replace(
"""function setupReadingScreen() {
    // Setup badges
    document.getElementById('story-genre-badge').textContent = AppState.config.genre;
    document.getElementById('story-difficulty-badge').textContent = AppState.config.difficulty;""",
"""function setupReadingScreen() {
    // Setup badges
    document.getElementById('story-genre-badge').textContent = AppState.config.genre;
    document.getElementById('story-difficulty-badge').textContent = 'Custom Level';"""
)

# 8. Mobile tap-to-place logic in Cloze challenge
content = content.replace(
"""    scrambledCards.forEach(card => {
        const pill = document.createElement('div');
        pill.className = 'drag-pill';
        pill.draggable = true;
        pill.dataset.wordId = card.id;
        pill.textContent = card.front;

        // Draggable events listeners
        pill.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            pill.classList.add('dragging');
        });""",
"""    let selectedTapPillId = null;
    let selectedTapPillEl = null;

    scrambledCards.forEach(card => {
        const pill = document.createElement('div');
        pill.className = 'drag-pill';
        pill.draggable = true;
        pill.dataset.wordId = card.id;
        pill.textContent = card.front;

        // Mobile tap selection
        pill.addEventListener('click', (e) => {
            if (selectedTapPillEl) {
                selectedTapPillEl.classList.remove('tap-selected');
                selectedTapPillEl.style.boxShadow = '';
            }
            if (selectedTapPillId === card.id) {
                // Deselect
                selectedTapPillId = null;
                selectedTapPillEl = null;
            } else {
                // Select
                selectedTapPillId = card.id;
                selectedTapPillEl = pill;
                pill.classList.add('tap-selected');
                pill.style.boxShadow = '0 0 15px var(--accent-gold)';
            }
        });

        // Draggable events listeners
        pill.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            pill.classList.add('dragging');
        });"""
)

# 9. Add zone tap-to-place event
content = content.replace(
"""    // Setup drop events on drop zones
    container.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();""",
"""    // Setup drop events on drop zones
    container.querySelectorAll('.drop-zone').forEach(zone => {
        // Mobile tap-to-place
        zone.addEventListener('click', () => {
            if (zone.classList.contains('correct') || !selectedTapPillId) return;

            const cardId = selectedTapPillId;
            const targetId = zone.dataset.wordId;

            validateClozeDrop(cardId, targetId, zone);

            // Clean up tap selection
            if (selectedTapPillEl) {
                selectedTapPillEl.classList.remove('tap-selected');
                selectedTapPillEl.style.boxShadow = '';
            }
            selectedTapPillId = null;
            selectedTapPillEl = null;
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();"""
)

# 10. Update victory screen summary text
content = content.replace(
"""    // Update labels
    document.getElementById('victory-quest-summary').textContent = `${AppState.config.genre} Quest solved on ${AppState.config.difficulty} difficulty.`;""",
"""    // Update labels
    document.getElementById('victory-quest-summary').textContent = `${AppState.config.genre} Quest solved!`;"""
)


with open('language_tool/static/index.js', 'w') as f:
    f.write(content)
