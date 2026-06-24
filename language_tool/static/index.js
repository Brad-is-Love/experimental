// LingoQuest Single-Page Application Game Controller

// Web Audio API Sound Synthesizer
const LingoAudio = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    isEnabled() {
        const cb = document.getElementById('settings-sound-effects');
        return cb ? cb.checked : true;
    },
    
    playCorrect() {
        if (!this.isEnabled()) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            
            // First note (root)
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, now); // C5
            gain1.gain.setValueAtTime(0.08, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);
            
            // Second note (major third, C5 -> E5) slightly delayed
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, now + 0.07); // E5
            gain2.gain.setValueAtTime(0.08, now + 0.07);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.07);
            osc2.stop(now + 0.28);
        } catch (e) {
            console.error("Audio error:", e);
        }
    },
    
    playError() {
        if (!this.isEnabled()) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, now); // Low buzz
            osc.frequency.linearRampToValueAtTime(80, now + 0.2);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            console.error("Audio error:", e);
        }
    },
    
    playTick() {
        if (!this.isEnabled()) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now); // Click
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.03);
        } catch (e) {
            console.error("Audio error:", e);
        }
    },
    
    playLevelUp() {
        if (!this.isEnabled()) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.06, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.35);
            });
        } catch (e) {
            console.error("Audio error:", e);
        }
    }
};

// Global Application State
const AppState = {
    // Persistent Stats (local storage synchronized)
    stats: {
        level: 1,
        xp: 0,
        coins: 0,
        streak: 0,
        lastActive: null, // YYYY-MM-DD
        soundEnabled: true
    },
    
    // Manually inputted API Key
    apiKey: '',
    
    // Current Active Screen (LANDING, LOADING_STORY, READING_STORY, CHALLENGE_CLOZE, CHALLENGE_COMPREHENSION, CHALLENGE_SPEED_MATCH, VICTORY)
    gameState: 'LANDING',
    
    // Selected settings
    config: {
        genre: 'Daily Life',
        difficulty: 'Novice',
        language_level: ''
    },
    
    // Loaded Deck / Vocab Cards
    vocabulary: [], // Array of { id, front, back }
    
    // Story details returned from backend
    story: {
        paragraphs: [], // Array of strings (raw HTML paragraphs with <vocab id="[id]">word</vocab>)
        questions: [],   // Array of { question, options[], answer, explanation }
        vocabUsed: []    // Subset of vocabulary actually used in story (loaded dynamically)
    },
    
    // Active gameplay variables
    gameSession: {
        inProgress: false,
        suspendedState: null,
        isResuming: false,
        xpAtQuestStart: 0,
        levelAtQuestStart: 1,
        xpEarned: 0,

        clozeMatches: {},      // id -> state
        clozeCorrectCount: 0,
        
        compCurrentQuestion: 0,
        compCorrectCount: 0,
        compAnswers: [],       // index -> selected option index
        
        speedMatchTimer: 20.0,
        speedMatchInterval: null,
        speedSelectedCard: null,
        speedMatchedCount: 0
    }
};

// Pre-baked Demo Decks
const DemoDecks = {
    spanish: [
        { id: "sp1", front: "el ferrocarril", back: "the railway / railroad" },
        { id: "sp2", front: "susurrar", db_front: "susurrar", back: "to whisper" },
        { id: "sp3", front: "sombrío", back: "gloomy / dark" },
        { id: "sp4", front: "el relámpago", back: "the lightning" },
        { id: "sp5", front: "evitar", back: "to avoid" },
        { id: "sp6", front: "esconder", back: "to hide" }
    ],
    japanese: [
        { id: "jp1", front: "木漏れ日 (komorebi)", back: "sunlight filtering through trees" },
        { id: "jp2", front: "猫 (neko)", back: "cat" },
        { id: "jp3", front: "静か (shizuka)", back: "quiet / peaceful" },
        { id: "jp4", front: "散歩する (sanpo suru)", back: "to take a walk" },
        { id: "jp5", front: "美味しい (oishii)", back: "delicious" },
        { id: "jp6", front: "喫茶店 (kissaten)", back: "cafe / coffee shop" }
    ]
};

// Rolling tips for the loader screen
const LearningTips = [
    "Tip: Click highlighted terms in the story to reveal full definitions and flag cards you find challenging.",
    "Tip: In the Cloze Rift, dragging a wrong card will shake the slot. Make sure to read the surrounding sentence context!",
    "Tip: The Speed Match trial applies a +1.5 second penalty for incorrect card pairings. Take your time to be accurate!",
    "Tip: Unlocking higher levels lets you access premium genres like Fantasy, Noir, and Sci-Fi.",
    "Tip: Keep your daily learning streak alive to boost your XP earnings for each Quest!"
];

// Initialize DOM Events
document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    bindHeaderEvents();
    bindLandingEvents();
    bindSettingsEvents();
    bindReadingEvents();
    bindComprehensionEvents();
    bindSpeedMatchEvents();
    bindVictoryEvents();
    
    // Initial Render
    syncHeaderStats();
    updateView();
    checkGenerateBtnState();
});

// View Routing State Transition
function setGameState(state) {
    AppState.gameState = state;
    updateView();
}

function updateView() {
    // Hide all view screens
    document.querySelectorAll('.screen-view').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Explicit state to screen ID mapping to fix blank view errors
    const stateToIdMap = {
        'LANDING': 'screen-landing',
        'LOADING_STORY': 'screen-loading',
        'READING_STORY': 'screen-reading',
        'CHALLENGE_CLOZE': 'screen-cloze',
        'CHALLENGE_COMPREHENSION': 'screen-comprehension',
        'CHALLENGE_SPEED_MATCH': 'screen-speed-match',
        'VICTORY': 'screen-victory'
    };
    
    const activeId = stateToIdMap[AppState.gameState];
    const activeScreen = document.getElementById(activeId);
    if (activeScreen) {
        activeScreen.classList.add('active');
    }
    
    // Page Entry Initializers
    if (AppState.gameState === 'LANDING') {
        const resumeBtn = document.getElementById('btn-resume-quest');
        if (resumeBtn) {
            if (AppState.gameSession && AppState.gameSession.inProgress) {
                resumeBtn.style.display = 'inline-flex';
            } else {
                resumeBtn.style.display = 'none';
            }
        }
    }
    
    if (AppState.gameState === 'LOADING_STORY') {
        startTipCarousel();
    } else {
        stopTipCarousel();
    }
    
    if (AppState.gameState === 'READING_STORY') {
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
    }
    
    // Smooth scroll page to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function spawnFloatingText(element, text, type = 'xp') {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const indicator = document.createElement('div');
    indicator.className = `floating-gain-indicator ${type}-gain`;
    indicator.textContent = text;
    
    // Position floating indicator relative to body scroll positions
    const bodyRect = document.body.getBoundingClientRect();
    const left = rect.left - bodyRect.left + rect.width / 2;
    const top = rect.top - bodyRect.top - 15;
    
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;
    
    document.body.appendChild(indicator);
    
    // Auto cleanup
    setTimeout(() => {
        indicator.remove();
    }, 1200);
}

function awardXP(amount, element) {
    AppState.stats.xp += amount;
    AppState.gameSession.xpEarned = (AppState.gameSession.xpEarned || 0) + amount;
    
    while (AppState.stats.xp >= AppState.stats.level * 150) {
        AppState.stats.xp -= AppState.stats.level * 150;
        AppState.stats.level++;
    }
    saveCurrentState();
    syncHeaderStats();
    if (element) {
        spawnFloatingText(element, `+${amount} XP`, 'xp');
    }
}

// Persist & Load Local Storage Data
function loadSavedState() {
    // Load Stats
    const savedStats = localStorage.getItem('lingoquest_player_stats');
    if (savedStats) {
        try {
            AppState.stats = JSON.parse(savedStats);
        } catch (e) {
            console.error("Failed to parse local stats, using defaults");
        }
    }
    
    // Load sound settings
    if (AppState.stats.soundEnabled === undefined) {
        AppState.stats.soundEnabled = true;
    }
    const soundCheckbox = document.getElementById('settings-sound-effects');
    if (soundCheckbox) {
        soundCheckbox.checked = AppState.stats.soundEnabled;
    }
    
    // Load API Key
    AppState.apiKey = localStorage.getItem('lingoquest_api_key') || '';
    document.getElementById('settings-api-key').value = AppState.apiKey;
    
    // Load Vocabulary cached from previous uploads (for instant play)
    const savedVocab = localStorage.getItem('lingoquest_stored_vocab');
    if (savedVocab) {
        try {
            AppState.vocabulary = JSON.parse(savedVocab);
            if (AppState.vocabulary.length > 0) {
                showUploadedDeckStatus(AppState.vocabulary.length, "Cached Anki Deck");
            }
        } catch (e) {
            console.error("Failed to parse cached vocabulary");
        }
    }

    // Load target language level description
    AppState.config.language_level = localStorage.getItem('lingoquest_language_level') || '';
    const langLevelInput = document.getElementById('target-language-level');
    if (langLevelInput) {
        langLevelInput.value = AppState.config.language_level;
    }
}

function saveCurrentState() {
    localStorage.setItem('lingoquest_player_stats', JSON.stringify(AppState.stats));
    localStorage.setItem('lingoquest_api_key', AppState.apiKey);
    localStorage.setItem('lingoquest_language_level', AppState.config.language_level);
    if (AppState.vocabulary.length > 0 && !AppState.vocabulary[0].id.startsWith('sp') && !AppState.vocabulary[0].id.startsWith('jp')) {
        localStorage.setItem('lingoquest_stored_vocab', JSON.stringify(AppState.vocabulary));
    }
}

function syncHeaderStats() {
    document.getElementById('header-streak').textContent = AppState.stats.streak;
    document.getElementById('header-coins').textContent = AppState.stats.coins;
    document.getElementById('header-level').textContent = AppState.stats.level;
    
    // Calculate level limit
    const targetXP = AppState.stats.level * 150;
    const progressPct = Math.min(100, (AppState.stats.xp / targetXP) * 100);
    
    document.getElementById('header-xp-fill').style.width = `${progressPct}%`;
    document.getElementById('header-xp-text').textContent = `${AppState.stats.xp} / ${targetXP} XP`;
    
    // Unlock genres based on level
    document.querySelectorAll('.genre-card.locked').forEach(card => {
        const unlockLv = parseInt(card.dataset.unlock);
        if (AppState.stats.level >= unlockLv) {
            card.classList.remove('locked');
            const label = card.querySelector('.unlock-label');
            if (label) label.remove();
        }
    });
}

// PERSISTENT HEADER & MENU HANDLERS
function bindHeaderEvents() {
    document.getElementById('logo-btn').addEventListener('click', () => {
        if (AppState.gameState !== 'LANDING' && AppState.gameState !== 'LOADING_STORY') {
            if (confirm("Return to the Tavern? You can resume your Quest progress later.")) {
                // Clear any running timers
                if (AppState.gameSession.speedMatchInterval) {
                    clearInterval(AppState.gameSession.speedMatchInterval);
                }
                AppState.gameSession.suspendedState = AppState.gameState;
                setGameState('LANDING');
            }
        }
    });
}

// SCREEN 1: LANDING VIEW HANDLERS
function bindLandingEvents() {
    // Genre select grid toggler
    const genreCards = document.querySelectorAll('.genre-card');
    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('locked')) {
                alert(`This genre is locked! Reach Level ${card.dataset.unlock} to unlock this adventure.`);
                return;
            }
            
            genreCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            AppState.config.genre = card.dataset.genre;
        });
    });

    // Difficulty select control
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.config.difficulty = btn.dataset.difficulty;
        });
    });

    // Target Language Level input listener
    const langLevelInput = document.getElementById('target-language-level');
    if (langLevelInput) {
        langLevelInput.addEventListener('input', () => {
            AppState.config.language_level = langLevelInput.value.trim();
            saveCurrentState();
            checkGenerateBtnState();
        });
    }
    
    // Drag & Drop Deck Upload
    const dropzone = document.getElementById('deck-dropzone');
    const fileInput = document.getElementById('anki-file-input');
    
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleAPKGFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleAPKGFile(e.target.files[0]);
        }
    });
    
    // Resume Quest Button
    document.getElementById('btn-resume-quest').addEventListener('click', () => {
        if (AppState.gameSession && AppState.gameSession.inProgress) {
            AppState.gameSession.isResuming = true;
            setGameState(AppState.gameSession.suspendedState || 'READING_STORY');
        }
    });
    
    // Generate Quest CTA
    document.getElementById('btn-generate-quest').addEventListener('click', () => {
        triggerQuestGeneration();
    });
}

function checkGenerateBtnState() {
    const generateBtn = document.getElementById('btn-generate-quest');
    if (!generateBtn) return;
    
    const langLevelInput = document.getElementById('target-language-level');
    const hasVocab = AppState.vocabulary.length > 0;
    const hasDescription = langLevelInput && langLevelInput.value.trim().length > 0;
    
    if (hasVocab || hasDescription) {
        generateBtn.removeAttribute('disabled');
    } else {
        generateBtn.setAttribute('disabled', 'true');
    }
}

function handleAPKGFile(file) {
    if (!file.name.endsWith('.apkg')) {
        alert("Only standard Anki .apkg files are supported.");
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Disable elements during upload
    const generateBtn = document.getElementById('btn-generate-quest');
    generateBtn.setAttribute('disabled', 'true');
    showUploadedDeckStatus(0, "Reading deck file...");
    
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            AppState.vocabulary = data.vocabulary;
            saveCurrentState(); // Cache locally
            showUploadedDeckStatus(data.vocabulary.length, file.name);
            checkGenerateBtnState();
        } else {
            alert(data.message || "Failed to read Anki deck file.");
            showUploadedDeckStatus(0, "Upload error");
        }
    })
    .catch(err => {
        console.error("Error uploading deck:", err);
        alert("Network error: Could not reach the server to extract the deck.");
        showUploadedDeckStatus(0, "Network error");
    });
}

function showUploadedDeckStatus(count, filename) {
    const loadedStatus = document.getElementById('deck-dropzone');
    const statusText = loadedStatus.querySelector('.upload-primary-text');
    const secondaryText = loadedStatus.querySelector('.upload-secondary-text');
    const icon = loadedStatus.querySelector('.upload-icon');
    
    if (count > 0) {
        statusText.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> ${filename} Loaded`;
        secondaryText.textContent = `${count} vocabulary items ready for Quest generator.`;
        icon.className = "fa-solid fa-box-open upload-icon text-success";
        document.getElementById('btn-generate-quest').removeAttribute('disabled');
    } else {
        statusText.innerHTML = filename;
        secondaryText.textContent = "Processing SQLite package database...";
    }
}

// SCREEN 2: LOADER HINTS CAROUSEL
let tipInterval = null;
function startTipCarousel() {
    const tipEl = document.getElementById('loading-tip');
    let idx = 0;
    
    document.getElementById('loading-title').textContent = `Gemini is weaving your ${AppState.config.genre} story...`;
    
    tipEl.textContent = LearningTips[idx];
    
    tipInterval = setInterval(() => {
        idx = (idx + 1) % LearningTips.length;
        tipEl.style.opacity = '0';
        setTimeout(() => {
            tipEl.textContent = LearningTips[idx];
            tipEl.style.opacity = '1';
        }, 300);
    }, 4500);
}

function stopTipCarousel() {
    if (tipInterval) {
        clearInterval(tipInterval);
        tipInterval = null;
    }
}

// STORY GENERATOR CONSUMER
function triggerQuestGeneration() {
    setGameState('LOADING_STORY');
    
    const langLevel = document.getElementById('target-language-level').value.trim();
    AppState.config.language_level = langLevel;

    // Choose 12 cards to send to generator
    const selectedVocab = AppState.vocabulary.sort(() => 0.5 - Math.random()).slice(0, 12);
    
    const payload = {
        genre: AppState.config.genre,
        difficulty: AppState.config.difficulty,
        language_level: langLevel,
        vocabulary: selectedVocab,
        apiKey: AppState.apiKey
    };
    
    fetch('/api/generate-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || `API error ${res.status}`);
        }
        return data;
    })
    .then(data => {
        if (data.status === 'success') {
            AppState.story.paragraphs = data.paragraphs;
            AppState.story.questions = data.questions;
            
            // Set vocabulary cards actually used in the story tags
            if (data.vocabulary && data.vocabulary.length > 0) {
                AppState.story.vocabUsed = data.vocabulary;
            } else {
                const usedIds = new Set();
                data.paragraphs.forEach(para => {
                    const regex = /<vocab\s+id=["']([^"']+)["']/g;
                    let match;
                    while ((match = regex.exec(para)) !== null) {
                        usedIds.add(match[1]);
                    }
                });
                AppState.story.vocabUsed = selectedVocab.filter(v => usedIds.has(v.id));
            }

            // Initialize game session tracking
            AppState.gameSession.inProgress = true;
            AppState.gameSession.xpAtQuestStart = AppState.stats.xp;
            AppState.gameSession.levelAtQuestStart = AppState.stats.level;
            AppState.gameSession.xpEarned = 0;
            AppState.gameSession.isResuming = false;
            AppState.gameSession.suspendedState = null;

            setGameState('READING_STORY');
        } else {
            alert(data.message || "Failed to generate story details.");
            setGameState('LANDING');
        }
    })
    .catch(err => {
        console.error("Story generation failed:", err);
        alert(err.message || "Network Error: Could not connect to Gemini API. Ensure you have an internet connection and your API key is correctly configured.");
        setGameState('LANDING');
    });
}

// SCREEN 3: READING & DEFINITIONS MODAL
function bindReadingEvents() {
    // Floating popover close action
    document.getElementById('popover-close').addEventListener('click', () => {
        document.getElementById('vocab-popover').classList.remove('visible');
    });
    
    // Mark card struggling / mastered click
    document.getElementById('popover-flag-struggling').addEventListener('click', (e) => {
        const wordId = e.currentTarget.dataset.wordId;
        e.currentTarget.classList.add('active');
        document.getElementById('popover-flag-mastered').classList.remove('active');
        // Visually update the vocab word class
        const vocabEl = document.querySelector(`.vocab-word[data-word-id="${wordId}"]`);
        if (vocabEl) {
            vocabEl.style.borderBottomColor = 'var(--state-failure)';
            vocabEl.style.backgroundColor = 'var(--state-failure-glow)';
        }
    });
    
    document.getElementById('popover-flag-mastered').addEventListener('click', (e) => {
        const wordId = e.currentTarget.dataset.wordId;
        e.currentTarget.classList.add('active');
        document.getElementById('popover-flag-struggling').classList.remove('active');
        // Visually update the vocab word class
        const vocabEl = document.querySelector(`.vocab-word[data-word-id="${wordId}"]`);
        if (vocabEl) {
            vocabEl.style.borderBottomColor = 'var(--state-success)';
            vocabEl.style.backgroundColor = 'var(--state-success-glow)';
        }
    });
    
    // Complete reading CTA
    document.getElementById('btn-start-challenges').addEventListener('click', () => {
        // Close popover
        document.getElementById('vocab-popover').classList.remove('visible');
        if (!AppState.gameSession.readingXPAwarded) {
            AppState.gameSession.readingXPAwarded = true;
            awardXP(20);
        }
        setGameState('CHALLENGE_CLOZE');
    });
}

function setupReadingScreen() {
    // Setup badges
    document.getElementById('story-genre-badge').textContent = AppState.config.genre;
    document.getElementById('story-difficulty-badge').textContent = AppState.config.language_level || AppState.config.difficulty;
    
    // Setup paragraph rendering
    const container = document.getElementById('story-paragraphs-container');
    container.innerHTML = '';
    
    AppState.story.paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        // Let paragraphs contain standard HTML elements like <vocab>
        p.innerHTML = paragraph;
        container.appendChild(p);
    });
    
    // Convert <vocab> tags to interactive markup
    const vocabTags = container.querySelectorAll('vocab');
    vocabTags.forEach(tag => {
        const id = tag.getAttribute('id');
        const text = tag.textContent;
        
        const span = document.createElement('span');
        span.className = 'vocab-word';
        span.dataset.wordId = id;
        span.textContent = text;
        
        if (tag.parentNode) {
            tag.parentNode.replaceChild(span, tag);
        }
    });
    
    // Bind click events on keywords
    container.querySelectorAll('.vocab-word').forEach(wordEl => {
        wordEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openVocabPopover(e.currentTarget, e.currentTarget.dataset.wordId);
        });
    });
    
    // Enable reading completion based on scroll height
    const completeBtn = document.getElementById('btn-start-challenges');
    const scrollPrompt = document.getElementById('scroll-prompt');
    
    completeBtn.setAttribute('disabled', 'true');
    scrollPrompt.style.display = 'flex';
    
    // Scroll event listener
    container.onscroll = () => {
        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 15) {
            completeBtn.removeAttribute('disabled');
            scrollPrompt.style.display = 'none';
        }
    };
    
    // Check if text is short and does not require scroll
    if (container.scrollHeight <= container.clientHeight) {
        completeBtn.removeAttribute('disabled');
        scrollPrompt.style.display = 'none';
    }
}

function openVocabPopover(anchorEl, wordId) {
    const popover = document.getElementById('vocab-popover');
    
    // Find matching vocab definition
    const card = AppState.story.vocabUsed.find(v => v.id === wordId);
    if (!card) return;
    
    document.getElementById('popover-front').textContent = card.front;
    document.getElementById('popover-back').textContent = card.back;
    
    // Bind action IDs
    document.getElementById('popover-flag-struggling').dataset.wordId = wordId;
    document.getElementById('popover-flag-mastered').dataset.wordId = wordId;
    
    // Reset buttons state
    document.getElementById('popover-flag-struggling').classList.remove('active');
    document.getElementById('popover-flag-mastered').classList.remove('active');
    
    // Position popup coordinates relative to keyword scroll position
    const anchorRect = anchorEl.getBoundingClientRect();
    const viewportRect = document.querySelector('.story-viewport-card').getBoundingClientRect();
    
    // Localize coordinates
    const top = (anchorRect.top - viewportRect.top) + anchorEl.offsetHeight + 8;
    const left = Math.max(10, Math.min(viewportRect.width - 250 - 10, (anchorRect.left - viewportRect.left)));
    
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    
    // Show popover using transition class
    popover.classList.add('visible');
}

// SCREEN 4: GAME 1 - CLOZE RIFT (DRAG & DROP / CLICK TO PLACE)
function setupClozeScreen() {
    const container = document.getElementById('cloze-story-paragraphs');
    container.innerHTML = '';
    
    const isResuming = AppState.gameSession.isResuming;
    
    if (!isResuming) {
        // Initialize sessions state
        AppState.gameSession.clozeMatches = {};
        AppState.gameSession.clozeCorrectCount = 0;
    }
    
    // Map paragraphs with blank slots
    AppState.story.paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.innerHTML = paragraph;
        container.appendChild(p);
    });
    
    // Convert <vocab> tags into drop-zones
    const vocabTags = container.querySelectorAll('vocab');
    const usedIds = new Set();
    
    vocabTags.forEach(tag => {
        const id = tag.getAttribute('id');
        const targetWord = tag.textContent;
        usedIds.add(id);
        
        if (!isResuming) {
            // Cache slot info
            AppState.gameSession.clozeMatches[id] = {
                id: id,
                target: targetWord,
                solved: false
            };
        }
        
        const match = AppState.gameSession.clozeMatches[id];
        const drop = document.createElement('div');
        if (match && match.solved) {
            drop.className = 'drop-zone correct';
            drop.textContent = match.target;
        } else {
            drop.className = 'drop-zone';
            drop.dataset.wordId = id;
            drop.textContent = '?';
        }
        
        if (tag.parentNode) {
            tag.parentNode.replaceChild(drop, tag);
        }
    });
    
    // Assemble tray pills containing vocabulary fronts scrambled
    const tray = document.getElementById('cloze-pills-tray');
    tray.innerHTML = '';
    
    const totalToSolve = Object.keys(AppState.gameSession.clozeMatches).length;
    if (AppState.gameSession.clozeCorrectCount >= totalToSolve) {
        triggerClozeRiftCompletion();
        return;
    }
    
    const relevantCards = AppState.story.vocabUsed.filter(v => usedIds.has(v.id));
    const unsolvedCards = relevantCards.filter(v => !AppState.gameSession.clozeMatches[v.id].solved);
    const scrambledCards = [...unsolvedCards].sort(() => 0.5 - Math.random());
    
    scrambledCards.forEach(card => {
        const pill = document.createElement('div');
        pill.className = 'drag-pill';
        pill.draggable = true;
        pill.dataset.wordId = card.id;
        pill.textContent = card.front;
        
        // Draggable events listeners
        pill.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            pill.classList.add('dragging');
        });
        
        pill.addEventListener('dragend', () => {
            pill.classList.remove('dragging');
        });
        
        // Tap/click events for mobile selection
        pill.addEventListener('click', () => {
            const selectedZone = container.querySelector('.drop-zone.selected');
            if (selectedZone) {
                const targetId = selectedZone.dataset.wordId;
                validateClozeDrop(card.id, targetId, selectedZone);
                selectedZone.classList.remove('selected');
            } else {
                const wasSelected = pill.classList.contains('selected');
                // Clear other selections
                container.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('selected'));
                tray.querySelectorAll('.drag-pill').forEach(p => p.classList.remove('selected'));
                if (!wasSelected) {
                    pill.classList.add('selected');
                }
            }
        });
        
        tray.appendChild(pill);
    });
    
    // Setup drop events and click events on drop zones
    container.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!zone.classList.contains('correct')) {
                zone.classList.add('dragover');
            }
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            if (zone.classList.contains('correct')) return;
            
            const cardId = e.dataTransfer.getData('text/plain');
            const targetId = zone.dataset.wordId;
            
            validateClozeDrop(cardId, targetId, zone);
        });
        
        zone.addEventListener('click', () => {
            if (zone.classList.contains('correct')) return;
            
            const selectedPill = tray.querySelector('.drag-pill.selected');
            if (selectedPill) {
                const cardId = selectedPill.dataset.wordId;
                const targetId = zone.dataset.wordId;
                validateClozeDrop(cardId, targetId, zone);
                selectedPill.classList.remove('selected');
            } else {
                const wasSelected = zone.classList.contains('selected');
                // Clear other selections
                container.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('selected'));
                tray.querySelectorAll('.drag-pill').forEach(p => p.classList.remove('selected'));
                if (!wasSelected) {
                    zone.classList.add('selected');
                }
            }
        });
    });
}

function validateClozeDrop(cardId, targetId, zoneEl) {
    const match = AppState.gameSession.clozeMatches[targetId];
    
    if (cardId === targetId) {
        // Correct snap!
        match.solved = true;
        AppState.gameSession.clozeCorrectCount++;
        
        zoneEl.className = 'drop-zone correct';
        zoneEl.textContent = match.target;
        
        // Sound and Floating text juice
        LingoAudio.playCorrect();
        awardXP(10, zoneEl);
        
        // Remove pill from tray
        const pill = document.querySelector(`.drag-pill[data-word-id="${cardId}"]`);
        if (pill) pill.remove();
        
        // Check complete
        const totalToSolve = Object.keys(AppState.gameSession.clozeMatches).length;
        if (AppState.gameSession.clozeCorrectCount >= totalToSolve) {
            triggerClozeRiftCompletion();
        }
    } else {
        // Incorrect shake!
        LingoAudio.playError();
        zoneEl.classList.add('shake-error');
        const pill = document.querySelector(`.drag-pill[data-word-id="${cardId}"]`);
        if (pill) {
            pill.classList.add('shake-error');
            setTimeout(() => pill.classList.remove('shake-error'), 400);
        }
        setTimeout(() => zoneEl.classList.remove('shake-error'), 400);
    }
}

function triggerClozeRiftCompletion() {
    // Show proceding card CTA in container
    const trayContainer = document.querySelector('.cloze-tray-container');
    trayContainer.innerHTML = `
        <div style="display:flex; justify-content:center; padding:10px 0; animation:fadeIn 0.3s forwards;">
            <button class="btn-primary btn-large btn-glow" id="btn-finish-cloze">
                Rift Restored! Proceed to Comprehension Quest (+30 XP) <i class="fa-solid fa-circle-arrow-right"></i>
            </button>
        </div>
    `;
    
    document.getElementById('btn-finish-cloze').addEventListener('click', () => {
        setGameState('CHALLENGE_COMPREHENSION');
    });
    
    // Spark local confetti success
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
        });
    }
}

// SCREEN 5: GAME 2 - COMPREHENSION QUEST
function bindComprehensionEvents() {
    document.getElementById('btn-next-question').addEventListener('click', () => {
        AppState.gameSession.compCurrentQuestion++;
        if (AppState.gameSession.compCurrentQuestion < 3) {
            renderComprehensionQuestion();
        } else {
            // Check for perfect comprehension bonus!
            if (AppState.gameSession.compCorrectCount === 3 && !AppState.gameSession.compPerfectBonusAwarded) {
                AppState.gameSession.compPerfectBonusAwarded = true;
                awardXP(15);
            }
            setGameState('CHALLENGE_SPEED_MATCH');
        }
    });
}

function setupComprehensionScreen() {
    const isResuming = AppState.gameSession.isResuming;
    if (!isResuming) {
        AppState.gameSession.compCurrentQuestion = 0;
        AppState.gameSession.compCorrectCount = 0;
        AppState.gameSession.compAnswers = [];
        AppState.gameSession.compPerfectBonusAwarded = false;
    }
    
    renderComprehensionQuestion();
}

function renderComprehensionQuestion() {
    const qIndex = AppState.gameSession.compCurrentQuestion;
    const questionData = AppState.story.questions[qIndex];
    if (!questionData) return;
    
    // Update step dots
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
        dot.className = 'step-dot';
        if (idx === qIndex) dot.classList.add('active');
        if (idx < qIndex) dot.classList.add('completed');
    });
    
    const chosenIdx = AppState.gameSession.compAnswers[qIndex];
    const isAnswered = chosenIdx !== undefined;

    // Reset layout
    document.getElementById('comp-question-title').textContent = questionData.question;
    
    if (isAnswered) {
        document.getElementById('comp-explanation-text').textContent = questionData.explanation;
        document.getElementById('comp-explanation-box').style.display = 'block';
        const nextBtn = document.getElementById('btn-next-question');
        nextBtn.style.display = 'block';
        if (qIndex === 2) {
            nextBtn.innerHTML = `Proceed to Speed Match (+30 XP) <i class="fa-solid fa-circle-arrow-right"></i>`;
        } else {
            nextBtn.innerHTML = `Next Question <i class="fa-solid fa-circle-arrow-right"></i>`;
        }
    } else {
        document.getElementById('comp-explanation-box').style.display = 'none';
        document.getElementById('btn-next-question').style.display = 'none';
    }
    
    const optionsContainer = document.getElementById('comp-options-container');
    optionsContainer.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    questionData.options.forEach((option, idx) => {
        const card = document.createElement('div');
        card.className = 'comp-option-card';
        card.dataset.index = idx;
        
        card.innerHTML = `
            <span class="option-badge">${letters[idx]}</span>
            <span class="option-text">${option}</span>
        `;
        
        if (isAnswered) {
            card.classList.add('locked');
            if (questionData.options[idx] === questionData.answer) {
                card.classList.add('correct');
            } else if (idx === chosenIdx) {
                card.classList.add('incorrect');
            }
        } else {
            card.addEventListener('click', () => {
                if (AppState.gameSession.compAnswers[qIndex] !== undefined) return; // Already answered
                validateComprehensionAnswer(idx, qIndex, card);
            });
        }
        
        optionsContainer.appendChild(card);
    });
}

function validateComprehensionAnswer(chosenIdx, qIndex, cardEl) {
    AppState.gameSession.compAnswers[qIndex] = chosenIdx;
    
    const questionData = AppState.story.questions[qIndex];
    const isCorrect = (questionData.options[chosenIdx] === questionData.answer);
    
    // Lock cards styling
    document.querySelectorAll('.comp-option-card').forEach(card => {
        card.classList.add('locked');
        const idx = parseInt(card.dataset.index);
        
        // Turn the correct answer green
        if (questionData.options[idx] === questionData.answer) {
            card.classList.add('correct');
        }
    });
    
    if (isCorrect) {
        AppState.gameSession.compCorrectCount++;
        LingoAudio.playCorrect();
        awardXP(10, cardEl);
        // Confetti burst
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 20,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 20,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }
    } else {
        LingoAudio.playError();
        cardEl.classList.add('incorrect');
    }
    
    // Show slide-down explanation details
    document.getElementById('comp-explanation-text').textContent = questionData.explanation;
    document.getElementById('comp-explanation-box').style.display = 'block';
    
    // Enable Next Question or Finish Button
    const nextBtn = document.getElementById('btn-next-question');
    nextBtn.style.display = 'block';
    if (qIndex === 2) {
        nextBtn.innerHTML = `Proceed to Speed Match (+30 XP) <i class="fa-solid fa-circle-arrow-right"></i>`;
    } else {
        nextBtn.innerHTML = `Next Question <i class="fa-solid fa-circle-arrow-right"></i>`;
    }
}

// SCREEN 6: GAME 3 - SPEED MATCH
function bindSpeedMatchEvents() {
    document.getElementById('btn-retry-speedmatch').addEventListener('click', () => {
        document.getElementById('speed-match-fail-overlay').classList.remove('visible');
        setupSpeedMatchScreen();
    });
}

function setupSpeedMatchScreen() {
    const grid = document.getElementById('speed-match-grid');
    
    const isResuming = AppState.gameSession.isResuming;
    AppState.gameSession.isResuming = false; // Reset the resume flag

    // Select words from round: take vocab actually used, slice up to 6
    const pool = AppState.story.vocabUsed.slice(0, 6);
    
    if (!isResuming) {
        grid.innerHTML = '';
        
        // Reset vars
        AppState.gameSession.speedMatchTimer = 20.0;
        AppState.gameSession.speedSelectedCard = null;
        AppState.gameSession.speedMatchedCount = 0;
        
        // Create card elements
        const cards = [];
        pool.forEach(item => {
            cards.push({ id: item.id, text: item.front, type: 'front' });
            cards.push({ id: item.id, text: item.back, type: 'back' });
        });
        
        // Scramble randomly
        const scrambled = cards.sort(() => 0.5 - Math.random());
        
        // Inject into DOM
        scrambled.forEach((card, idx) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'speed-card';
            cardEl.dataset.id = card.id;
            cardEl.dataset.type = card.type;
            cardEl.dataset.index = idx;
            cardEl.textContent = card.text;
            
            cardEl.addEventListener('click', () => {
                handleSpeedCardClick(cardEl);
            });
            
            grid.appendChild(cardEl);
        });
    }
    
    const timerContainer = document.querySelector('.speed-match-timer-container');
    if (timerContainer) {
        timerContainer.classList.remove('warning-pulse');
    }
    
    // Update instruction text dynamically
    const instructionEl = document.querySelector('#screen-speed-match .story-instruction');
    if (instructionEl) {
        instructionEl.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Match ${pool.length} pairs before time runs out! (+1.5s error penalty)`;
    }

    // Launch countdown timer
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
}

function updateSpeedMatchTimerUI() {
    const val = AppState.gameSession.speedMatchTimer.toFixed(1);
    document.getElementById('speed-match-timer-value').textContent = `${val}s`;
    
    const pct = (AppState.gameSession.speedMatchTimer / 20.0) * 100;
    document.getElementById('speed-match-timer-fill').style.width = `${pct}%`;
}

function handleSpeedCardClick(cardEl) {
    const selected = AppState.gameSession.speedSelectedCard;
    
    if (cardEl.classList.contains('correct') || cardEl.classList.contains('selected')) return;
    
    // Visual flash cleanup
    document.querySelectorAll('.speed-card.incorrect').forEach(c => c.classList.remove('incorrect'));
    
    if (!selected) {
        // First card selected
        AppState.gameSession.speedSelectedCard = cardEl;
        cardEl.classList.add('selected');
    } else {
        // Second card selected - compare
        const firstId = selected.dataset.id;
        const firstType = selected.dataset.type;
        const secondId = cardEl.dataset.id;
        const secondType = cardEl.dataset.type;
        
        const poolLimit = AppState.story.vocabUsed.slice(0, 6).length;
        
        if (firstId === secondId && firstType !== secondType) {
            // Correct Pair Match!
            selected.classList.remove('selected');
            selected.classList.add('correct');
            cardEl.classList.add('correct');
            
            LingoAudio.playCorrect();
            spawnFloatingText(cardEl, "Match!", 'xp');
            
            AppState.gameSession.speedSelectedCard = null;
            AppState.gameSession.speedMatchedCount++;
            
            // Check completed
            if (AppState.gameSession.speedMatchedCount >= poolLimit) {
                clearInterval(AppState.gameSession.speedMatchInterval);
                // Award Speed Match XP in real-time!
                const speedTime = 20.0 - AppState.gameSession.speedMatchTimer;
                const speedXP = 20 + (speedTime <= 10.0 ? 10 : 0);
                awardXP(speedXP);
                // Pause briefly before victory screen
                setTimeout(() => {
                    setGameState('VICTORY');
                }, 600);
            }
        } else {
            // Error mismatch
            selected.classList.remove('selected');
            selected.classList.add('incorrect');
            cardEl.classList.add('incorrect');
            
            LingoAudio.playError();
            spawnFloatingText(cardEl, "-1.5s", 'penalty');
            
            // Deduct penalty -1.5 seconds
            AppState.gameSession.speedMatchTimer = Math.max(0, AppState.gameSession.speedMatchTimer - 1.5);
            
            // Shake animations
            selected.classList.add('shake-error');
            cardEl.classList.add('shake-error');
            setTimeout(() => {
                selected.classList.remove('shake-error');
                cardEl.classList.remove('shake-error');
            }, 400);
            
            AppState.gameSession.speedSelectedCard = null;
        }
    }
}

function triggerSpeedMatchFailure() {
    document.getElementById('speed-match-fail-overlay').classList.add('visible');
}

// SCREEN 7: VICTORY & STATS CALCULATION
function bindVictoryEvents() {
    document.getElementById('btn-return-landing').addEventListener('click', () => {
        AppState.gameSession.inProgress = false; // Reset quest progress state on successful finish
        setGameState('LANDING');
        syncHeaderStats();
    });
}

function setupVictoryScreen() {
    AppState.gameSession.inProgress = false; // Quest completed!

    // Generate XP Details
    const clozeXP = AppState.gameSession.clozeCorrectCount * 10;
    const compScore = AppState.gameSession.compCorrectCount;
    const compXP = compScore * 10 + (compScore === 3 ? 15 : 0); // 10 per q, +15 perfect
    
    const speedTime = 20.0 - AppState.gameSession.speedMatchTimer;
    const speedXP = 20 + (speedTime <= 10.0 ? 10 : 0); // 20 standard, +10 speed bonus
    const totalXP = AppState.gameSession.xpEarned || (20 + clozeXP + compXP + speedXP); // Story read: 20
    const totalCoins = 15;
    
    // Update labels
    document.getElementById('victory-quest-summary').textContent = `${AppState.config.genre} Quest solved.`;
    document.getElementById('victory-xp-cloze').textContent = `+${clozeXP} XP`;
    document.getElementById('victory-xp-comp').textContent = `+${compXP} XP (${compScore}/3 correct)`;
    document.getElementById('victory-xp-speed').textContent = `+${speedXP} XP (${speedTime.toFixed(1)}s elapsed)`;
    document.getElementById('victory-total-xp').textContent = `+${totalXP} XP`;
    document.getElementById('victory-total-coins').textContent = `+${totalCoins} Coins`;
    
    // Trigger celebration effects
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.65 }
        });
    }
    
    // Apply coin gains (XP has already been added in real-time!)
    AppState.stats.coins += totalCoins;
    
    // Calculate Streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (AppState.stats.lastActive) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (AppState.stats.lastActive === yesterdayStr) {
            AppState.stats.streak++;
        } else if (AppState.stats.lastActive !== todayStr) {
            AppState.stats.streak = 1;
        }
    } else {
        AppState.stats.streak = 1;
    }
    AppState.stats.lastActive = todayStr;
    
    // Render progress circle animation starting from initial quest values
    const oldLevel = AppState.gameSession.levelAtQuestStart || 1;
    const oldXP = AppState.gameSession.xpAtQuestStart || 0;
    
    // Render progress circle animation
    setTimeout(() => {
        animateXPProgressCircle(oldLevel, oldXP, AppState.stats.level, AppState.stats.xp);
        
        // Spawn floating indicators on score labels
        const xpEl = document.getElementById('victory-total-xp');
        const coinsEl = document.getElementById('victory-total-coins');
        if (xpEl) spawnFloatingText(xpEl, `+${totalXP} XP`, 'xp');
        setTimeout(() => {
            if (coinsEl) spawnFloatingText(coinsEl, `+${totalCoins} Coins`, 'coins');
        }, 300);
    }, 400);
    
    // Save state
    saveCurrentState();
    
    // Show Level Up Modal Overlay if unlocked during this quest
    const leveledUp = AppState.stats.level > oldLevel;
    if (leveledUp) {
        setTimeout(() => {
            triggerLevelUpModal(AppState.stats.level);
        }, 1800); // slightly delayed to allow circle animation to finalize
    }
}

function animateXPProgressCircle(startLv, startXp, endLv, endXp) {
    const circle = document.getElementById('victory-circle-fill');
    const textDetails = document.getElementById('victory-xp-details-text');
    const levelVal = document.getElementById('victory-level');
    const circumference = 314; // 2 * PI * 50
    
    let currentLv = startLv;
    let currentXp = startXp;
    
    // Animate over 1.5 seconds (1500ms), checking progress every 25ms
    const duration = 1500;
    const intervalTime = 25;
    const totalSteps = duration / intervalTime;
    
    // Accumulate absolute total XP at start and end
    let totalXpStart = 0;
    for (let l = 1; l < startLv; l++) {
        totalXpStart += l * 150;
    }
    totalXpStart += startXp;
    
    let totalXpEnd = 0;
    for (let l = 1; l < endLv; l++) {
        totalXpEnd += l * 150;
    }
    totalXpEnd += endXp;
    
    const xpDiff = totalXpEnd - totalXpStart;
    if (xpDiff <= 0) {
        const targetXP = endLv * 150;
        circle.style.strokeDashoffset = circumference - (endXp / targetXP) * circumference;
        levelVal.textContent = endLv;
        textDetails.textContent = `${endXp} / ${targetXP} XP`;
        return;
    }
    
    let step = 0;
    levelVal.dataset.lastDisplayed = startLv;
    
    const animInterval = setInterval(() => {
        step++;
        if (step >= totalSteps) {
            clearInterval(animInterval);
            currentLv = endLv;
            currentXp = endXp;
        } else {
            const ratio = step / totalSteps;
            const easeOutRatio = 1 - (1 - ratio) * (1 - ratio); // deceleration
            const currentTotalXp = totalXpStart + xpDiff * easeOutRatio;
            
            let tempTotal = currentTotalXp;
            let tempLv = 1;
            while (tempTotal >= tempLv * 150) {
                tempTotal -= tempLv * 150;
                tempLv++;
            }
            currentLv = tempLv;
            currentXp = Math.round(tempTotal);
        }
        
        const targetXP = currentLv * 150;
        const progressPct = currentXp / targetXP;
        const offset = circumference - (progressPct * circumference);
        
        circle.style.strokeDashoffset = offset;
        levelVal.textContent = currentLv;
        textDetails.textContent = `${currentXp} / ${targetXP} XP`;
        
        // Pulse badge on level crossings during animation
        const displayedLevelNum = parseInt(levelVal.textContent);
        if (displayedLevelNum > parseInt(levelVal.dataset.lastDisplayed)) {
            levelVal.dataset.lastDisplayed = displayedLevelNum;
            levelVal.style.transform = 'scale(1.4)';
            setTimeout(() => {
                levelVal.style.transform = 'scale(1)';
            }, 200);
            LingoAudio.playCorrect();
        }
    }, intervalTime);
}

function triggerLevelUpModal(newLevel) {
    const modal = document.getElementById('level-up-modal');
    document.getElementById('level-up-number').textContent = newLevel;
    
    const unlocksContainer = document.getElementById('level-up-unlocks');
    unlocksContainer.innerHTML = '';
    
    let unlockHTML = '';
    if (newLevel === 2) {
        unlockHTML = `
            <div class="unlock-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Unlocked: Fantasy & Noir Mystery Genres</span>
            </div>
        `;
    } else if (newLevel === 3) {
        unlockHTML = `
            <div class="unlock-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Unlocked: Sci-Fi & Cyberpunk Genres</span>
            </div>
        `;
    } else {
        unlockHTML = `
            <div class="unlock-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Linguistic Bonus: +50 Coins Added!</span>
            </div>
        `;
        AppState.stats.coins += 50;
        saveCurrentState();
    }
    
    unlocksContainer.innerHTML = unlockHTML;
    modal.classList.add('visible');
    
    // Play triumphant synth cue
    LingoAudio.playLevelUp();
    
    // Level Up Confetti Rain
    if (typeof confetti === 'function') {
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
    }
}

// SCREEN 8: SYSTEM SETTINGS MODAL & RESET PROGRESS
function bindSettingsEvents() {
    const modal = document.getElementById('modal-settings');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');
    const saveBtn = document.getElementById('btn-save-settings');
    const clearBtn = document.getElementById('btn-clear-api-key');
    const resetBtn = document.getElementById('btn-clear-progress');
    const levelUpModal = document.getElementById('level-up-modal');
    
    openBtn.addEventListener('click', () => {
        document.getElementById('settings-api-key').value = AppState.apiKey;
        const soundCheckbox = document.getElementById('settings-sound-effects');
        if (soundCheckbox) {
            soundCheckbox.checked = AppState.stats.soundEnabled !== false;
        }
        modal.classList.add('visible');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
    });
    
    // Backdrop click close for settings
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
        }
    });

    // Backdrop click close for level up modal
    levelUpModal.addEventListener('click', (e) => {
        if (e.target === levelUpModal) {
            levelUpModal.classList.remove('visible');
        }
    });
    
    saveBtn.addEventListener('click', () => {
        AppState.apiKey = document.getElementById('settings-api-key').value.trim();
        const soundCheckbox = document.getElementById('settings-sound-effects');
        if (soundCheckbox) {
            AppState.stats.soundEnabled = soundCheckbox.checked;
        }
        saveCurrentState();
        modal.classList.remove('visible');
    });
    
    clearBtn.addEventListener('click', () => {
        AppState.apiKey = '';
        document.getElementById('settings-api-key').value = '';
        saveCurrentState();
        modal.classList.remove('visible');
        alert("API Key cleared.");
    });
    
    resetBtn.addEventListener('click', () => {
        if (confirm("WARNING: This will delete all your Level, XP, Streaks, Coins, and cached decks. Are you sure you want to reset your account?")) {
            AppState.stats = {
                level: 1,
                xp: 0,
                coins: 0,
                streak: 0,
                lastActive: null,
                soundEnabled: true
            };
            AppState.vocabulary = [];
            AppState.gameSession.inProgress = false;
            AppState.gameSession.suspendedState = null;
            AppState.gameSession.isResuming = false;
            localStorage.removeItem('lingoquest_player_stats');
            localStorage.removeItem('lingoquest_stored_vocab');
            localStorage.removeItem('lingoquest_language_level');
            saveCurrentState();
            syncHeaderStats();
            
            // Reset Dropzone UI
            const dropzone = document.getElementById('deck-dropzone');
            dropzone.querySelector('.upload-primary-text').innerHTML = "Drop your Anki <strong>.apkg</strong> file here";
            dropzone.querySelector('.upload-secondary-text').textContent = "or click to browse local files";
            dropzone.querySelector('.upload-icon').className = "fa-solid fa-box-open upload-icon";
            document.getElementById('btn-generate-quest').setAttribute('disabled', 'true');
            
            modal.classList.remove('visible');
            setGameState('LANDING');
            alert("Progress has been fully reset.");
        }
    });
    
    document.getElementById('btn-level-up-close').addEventListener('click', () => {
        levelUpModal.classList.remove('visible');
    });
}
