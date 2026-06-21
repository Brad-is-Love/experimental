// app.js
// Core application orchestrator, state manager, and view controller

import { SYLLABUS_LEVELS, ENDLESS_PUZZLES } from "./database.js";
import { 
  playSuccessChime, 
  playFailureClick, 
  playBootHum, 
  playHoverTick, 
  playBlitzWarningTick, 
  playBlitzGameOver, 
  playDrawerSweep, 
  playLevelVictory 
} from "./audio.js";
import { ChessBoardRenderer } from "./board.js";

// Global App State
const appState = {
  viewState: "LANDING", // "LANDING" | "SYLLABUS_PLAY" | "BLITZ_PLAY" | "LEVEL_COMPLETE"
  activeLevelId: null,
  activeStageIndex: 0,
  isXRayActive: true,
  hintUsed: false,

  // Endless Blitz Mode State
  blitzTimeRemaining: 10,
  blitzScore: 0,
  blitzStreak: 0,
  blitzHighScore: 0,
  blitzActivePositionIndex: 0,
  blitzTimerId: null,

  // Selected / interaction tracking
  completedLevels: {}, // { [levelId]: true }
  answersLogged: []
};

// Chessboard Renderers
let landingBoard = null;
let playBoard = null;
let blitzBoard = null;

// DOM Cache
const dom = {};

function initDOMCache() {
  dom.landingScreen = document.getElementById("landing-screen");
  dom.playScreen = document.getElementById("play-screen");
  dom.blitzScreen = document.getElementById("blitz-screen");
  dom.victoryModal = document.getElementById("victory-modal");
  dom.tippingPanel = document.getElementById("tipping-panel");
  dom.backdropOverlay = document.getElementById("backdrop-overlay");

  dom.stageHud = document.getElementById("stage-hud");
  dom.strategicQuestion = document.getElementById("strategic-question");
  dom.optionsContainer = document.getElementById("options-container");
  dom.feedbackPanel = document.getElementById("feedback-panel");
  dom.feedbackText = document.getElementById("feedback-text");
  dom.feedbackBtn = document.getElementById("feedback-btn");

  dom.blitzTimer = document.getElementById("blitz-timer");
  dom.blitzTimerRing = document.getElementById("blitz-timer-ring");
  dom.blitzQuestion = document.getElementById("blitz-question");
  dom.blitzScoreVal = document.getElementById("blitz-score-val");
  dom.blitzStreakVal = document.getElementById("blitz-streak-val");
  dom.blitzHighScoreVal = document.getElementById("blitz-highscore-val");

  dom.victoryTitle = document.getElementById("victory-title");
  dom.victoryStats = document.getElementById("victory-stats");
  dom.victoryActionBtn = document.getElementById("victory-action-btn");
  dom.confettiCanvas = document.getElementById("confetti-canvas");

  dom.xrayToggleBtn = document.getElementById("xray-toggle-btn");
  dom.hintBtn = document.getElementById("hint-btn");
  dom.tipsBadgeBtn = document.getElementById("tips-badge-btn");
}

/**
 * Bootstraps the application on DOMContentLoaded
 */
function initApp() {
  initDOMCache();
  loadProgress();

  // Instantiate Chess Board Renderers
  landingBoard = new ChessBoardRenderer(document.getElementById("landing-board-container"));
  playBoard = new ChessBoardRenderer(document.getElementById("play-board-container"));
  blitzBoard = new ChessBoardRenderer(document.getElementById("blitz-board-container"));

  // Bind Renderer Callbacks
  playBoard.onSquareClick((square) => handleSquareClick(square, "SYLLABUS"));
  playBoard.onMoveMade((from, to) => handleMoveMade(from, to, "SYLLABUS"));

  blitzBoard.onSquareClick((square) => handleSquareClick(square, "BLITZ"));
  blitzBoard.onMoveMade((from, to) => handleMoveMade(from, to, "BLITZ"));

  // Attach DOM Listeners
  bindEvents();

  // Navigate to Landing
  navigateTo("LANDING");
}

function bindEvents() {
  // Navigation / Toggles
  dom.xrayToggleBtn.addEventListener("click", () => {
    appState.isXRayActive = !appState.isXRayActive;
    playBootHum();
    updateXRayState();
  });

  dom.hintBtn.addEventListener("click", () => {
    if (appState.viewState === "SYLLABUS_PLAY") {
      triggerHint();
    }
  });

  // Backdrop overlay click closes panel
  dom.backdropOverlay.addEventListener("click", () => {
    closeAllModals();
  });

  // Tipping Panel Events
  dom.tipsBadgeBtn.addEventListener("click", () => toggleTippingPanel(true));
  document.getElementById("close-tips-btn").addEventListener("click", () => toggleTippingPanel(false));
  document.getElementById("open-tips-menu").addEventListener("click", (e) => {
    e.preventDefault();
    toggleTippingPanel(true);
  });

  // Tabs within tipping panel
  const tabs = document.querySelectorAll(".tips-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetMethod = tab.dataset.target;
      document.querySelectorAll(".tips-content").forEach((c) => {
        c.style.display = c.id === `${targetMethod}-content` ? "block" : "none";
      });
      playHoverTick();
    });
  });

  // Copy Buttons
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.dataset.copyTarget;
      const input = document.getElementById(inputId);
      if (input) {
        input.select();
        document.execCommand("copy");
        
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.borderColor = "var(--neon-green)";
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.borderColor = "";
        }, 1500);
      }
    });
    btn.addEventListener("mouseenter", () => playHoverTick());
  });

  // Level selection from Landing
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".level-card");
    if (card) {
      const levelId = parseInt(card.dataset.levelId, 10);
      startSyllabusLevel(levelId);
    }
  });

  // Endless start
  document.getElementById("endless-start-btn").addEventListener("click", () => {
    startEndlessBlitz();
  });

  // Exit buttons
  document.getElementById("exit-play-btn").addEventListener("click", () => {
    navigateTo("LANDING");
  });
  document.getElementById("exit-blitz-btn").addEventListener("click", () => {
    stopBlitzTimer();
    navigateTo("LANDING");
  });

  // Feedback action (Next Stage)
  dom.feedbackBtn.addEventListener("click", () => {
    advanceStage();
  });

  // Hover ticks for static UI buttons
  const hoverElements = [
    dom.xrayToggleBtn,
    dom.hintBtn,
    dom.tipsBadgeBtn,
    document.getElementById("endless-start-btn"),
    document.getElementById("exit-play-btn"),
    document.getElementById("exit-blitz-btn"),
    document.getElementById("close-tips-btn"),
    document.getElementById("victory-action-btn")
  ];
  hoverElements.forEach((el) => {
    if (el) {
      el.addEventListener("mouseenter", () => playHoverTick());
    }
  });
}

/**
 * Dynamic view router
 * @param {string} targetView
 */
function navigateTo(targetView) {
  appState.viewState = targetView;
  closeAllModals();

  dom.landingScreen.classList.remove("active");
  dom.playScreen.classList.remove("active");
  dom.blitzScreen.classList.remove("active");

  if (targetView === "LANDING") {
    dom.landingScreen.classList.add("active");
    renderLandingHub();
  } else if (targetView === "SYLLABUS_PLAY") {
    dom.playScreen.classList.add("active");
    loadSyllabusStage();
  } else if (targetView === "BLITZ_PLAY") {
    dom.blitzScreen.classList.add("active");
    loadBlitzPuzzle();
  }
  
  updateXRayState();
}

/**
 * Landing Page renderer
 */
function renderLandingHub() {
  // Load standard Carlsbad FEN into landing board
  const carlsbadFEN = "r1r3k1/1b1nbppp/1ppqp3/3p4/1P1P4/2N1PN2/2Q1BPPP/1RR3K1 w - - 0 1";
  landingBoard.loadFEN(carlsbadFEN);
  landingBoard.applyOverlays({
    chains: [
      ["d5", "e6", "f7", "g7", "h7"],
      ["a6", "b6"],
      ["d4", "e3", "f2", "g2", "h2"]
    ],
    weaknesses: ["c6"]
  });

  // Render cards with completion states
  const levelsContainer = document.getElementById("syllabus-grid");
  levelsContainer.innerHTML = "";

  SYLLABUS_LEVELS.forEach((level) => {
    const isCompleted = appState.completedLevels[level.id];
    const card = document.createElement("div");
    card.className = `level-card glass ${isCompleted ? "completed" : ""}`;
    card.dataset.levelId = level.id;
    card.innerHTML = `
      <div class="level-badge">${isCompleted ? "✓ Completed" : `Level ${level.id}`}</div>
      <h3 class="level-title">${level.title}</h3>
      <p class="level-desc">${level.concept}</p>
      <div class="level-status-btn">${isCompleted ? "Replay Level" : "Start Training"}</div>
    `;
    card.addEventListener("mouseenter", () => playHoverTick());
    levelsContainer.appendChild(card);
  });
}

/**
 * Stage loader for syllabus levels
 */
function startSyllabusLevel(levelId) {
  appState.activeLevelId = levelId;
  appState.activeStageIndex = 0;
  navigateTo("SYLLABUS_PLAY");
}

function loadSyllabusStage() {
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  const stage = level.stages[appState.activeStageIndex];

  appState.hintUsed = false;
  dom.feedbackPanel.classList.remove("active");
  playBoard.clearSelection();

  // Set HUD Texts
  dom.stageHud.innerText = `Level ${level.id} | Stage ${appState.activeStageIndex + 1} of ${level.stages.length}`;
  dom.strategicQuestion.innerText = stage.question;

  // Load board FEN and apply overlay layout
  playBoard.loadFEN(level.fen);
  playBoard.applyOverlays(stage.xrayHighlights);

  // Render multiple choice if PLAN_SELECTION
  dom.optionsContainer.innerHTML = "";
  if (stage.type === "PLAN_SELECTION" && stage.options) {
    dom.optionsContainer.style.display = "flex";
    stage.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn glass";
      btn.innerText = opt;
      btn.addEventListener("click", () => handlePlanSelect(idx.toString()));
      btn.addEventListener("mouseenter", () => playHoverTick());
      dom.optionsContainer.appendChild(btn);
    });
  } else {
    dom.optionsContainer.style.display = "none";
  }
}

/**
 * Handle user clicks for target coordinates
 */
function handleSquareClick(square, mode) {
  if (mode === "SYLLABUS") {
    if (appState.viewState !== "SYLLABUS_PLAY") return;
    const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
    const stage = level.stages[appState.activeStageIndex];

    if (stage.type === "CLICK_WEAKNESS" || stage.type === "CLICK_OUTPOST") {
      validateAnswer(square, stage.correctTarget);
    }
  } else {
    // BLITZ mode click checks
    if (appState.viewState !== "BLITZ_PLAY") return;
    const puzzle = ENDLESS_PUZZLES[appState.blitzActivePositionIndex];
    validateBlitzAnswer(square);
  }
}

/**
 * Handle user drag pawn moves
 */
function handleMoveMade(from, to, mode) {
  const moveStr = `${from}-${to}`;
  if (mode === "SYLLABUS") {
    if (appState.viewState !== "SYLLABUS_PLAY") return;
    const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
    const stage = level.stages[appState.activeStageIndex];

    if (stage.type === "MOVE_PAWN") {
      validateAnswer(moveStr, stage.correctTarget);
    }
  } else {
    if (appState.viewState !== "BLITZ_PLAY") return;
    validateBlitzAnswer(moveStr);
  }
}

/**
 * Handle multiple choice plan selections
 */
function handlePlanSelect(optionIdx) {
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  const stage = level.stages[appState.activeStageIndex];
  validateAnswer(optionIdx, stage.correctTarget);
}

/**
 * Validate responses for Syllabus levels
 */
function validateAnswer(input, correctTargetsStr) {
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  const stage = level.stages[appState.activeStageIndex];
  const targets = correctTargetsStr.split(",");

  const isCorrect = targets.includes(input);

  if (isCorrect) {
    playSuccessChime();
    playBoard.applyOverlays(stage.xrayHighlights);
    
    // Highlight visual target
    if (stage.type !== "PLAN_SELECTION") {
      const square = input.includes("-") ? input.split("-")[1] : input;
      const sqEl = document.querySelector(`[data-square="${square}"]`);
      if (sqEl) {
        sqEl.classList.add("success-pulse");
      }
    }

    // Display Feedback Card
    dom.feedbackText.innerText = stage.successText;
    dom.feedbackPanel.classList.add("active");
    dom.feedbackPanel.className = "active success-card glass";

    // Disable interactions by clearing active stage options/highlighting target
    dom.optionsContainer.querySelectorAll("button").forEach((b) => b.disabled = true);
    
    appState.answersLogged.push({
      levelId: appState.activeLevelId,
      stageIndex: appState.activeStageIndex,
      correct: true,
      hintUsed: appState.hintUsed,
      timestamp: Date.now()
    });
  } else {
    playFailureClick();

    // Visual failure juice
    if (stage.type !== "PLAN_SELECTION") {
      const errorSquare = input.includes("-") ? input.split("-")[0] : input;
      playBoard.shakeSquare(errorSquare);
    }

    // Display guiding hint
    dom.feedbackText.innerText = stage.failureText;
    dom.feedbackPanel.classList.add("active");
    dom.feedbackPanel.className = "active failure-card glass";

    appState.answersLogged.push({
      levelId: appState.activeLevelId,
      stageIndex: appState.activeStageIndex,
      correct: false,
      hintUsed: appState.hintUsed,
      timestamp: Date.now()
    });
  }
}

/**
 * Progress stage transitions
 */
function advanceStage() {
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  
  // Only advance if success card is showing
  if (!dom.feedbackPanel.classList.contains("success-card")) {
    dom.feedbackPanel.classList.remove("active");
    return;
  }

  if (appState.activeStageIndex < level.stages.length - 1) {
    appState.activeStageIndex++;
    loadSyllabusStage();
  } else {
    // Level Cleared
    appState.completedLevels[appState.activeLevelId] = true;
    saveProgress();
    showLevelVictory();
  }
}

function showLevelVictory() {
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  dom.victoryTitle.innerText = "Level Cleared!";
  
  // Play the level completion fanfare sound!
  playLevelVictory();

  // Calculate accuracy
  const attempts = appState.answersLogged.filter((log) => log.levelId === level.id);
  const correct = attempts.filter((log) => log.correct).length;
  const total = attempts.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  dom.victoryStats.innerHTML = `
    <p>Structure Mastered: <strong>${level.title}</strong></p>
    <p>Accuracy Rating: <strong>${accuracy}%</strong></p>
    <p>Strategic alignment unlocked.</p>
  `;

  // Action button routing
  const nextLevelId = level.id + 1;
  const nextLevelExists = SYLLABUS_LEVELS.some((l) => l.id === nextLevelId);

  if (nextLevelExists) {
    dom.victoryActionBtn.innerText = "Begin Next Level";
    dom.victoryActionBtn.onclick = () => {
      startSyllabusLevel(nextLevelId);
    };
  } else {
    dom.victoryActionBtn.innerText = "Return to Hub";
    dom.victoryActionBtn.onclick = () => {
      navigateTo("LANDING");
    };
  }

  dom.victoryModal.style.display = "flex";
  dom.backdropOverlay.classList.add("active");
  triggerConfetti();
}

/**
 * Trigger visual helper highlights
 */
function triggerHint() {
  appState.hintUsed = true;
  const level = SYLLABUS_LEVELS.find((l) => l.id === appState.activeLevelId);
  const stage = level.stages[appState.activeStageIndex];
  
  // Find hint squares (either target square directly, or source of move)
  let squares = [];
  if (stage.correctTarget.includes("-")) {
    squares = [stage.correctTarget.split("-")[0]];
  } else {
    squares = stage.correctTarget.split(",");
  }
  playBoard.showHintSquares(squares);
}

/**
 * Endless Blitz Mode
 */
function startEndlessBlitz() {
  appState.blitzScore = 0;
  appState.blitzStreak = 0;
  appState.blitzTimeRemaining = 10;
  appState.blitzActivePositionIndex = 0;
  navigateTo("BLITZ_PLAY");
}

function loadBlitzPuzzle() {
  // Pull random from puzzle deck
  appState.blitzActivePositionIndex = Math.floor(Math.random() * ENDLESS_PUZZLES.length);
  const puzzle = ENDLESS_PUZZLES[appState.blitzActivePositionIndex];

  dom.blitzQuestion.innerText = puzzle.question;
  blitzBoard.loadFEN(puzzle.fen);
  blitzBoard.applyOverlays(puzzle.xrayHighlights);

  updateBlitzStats();
  startBlitzTimer();
}

function validateBlitzAnswer(input) {
  const puzzle = ENDLESS_PUZZLES[appState.blitzActivePositionIndex];
  const targets = puzzle.correctTarget.split(",");
  const isCorrect = targets.includes(input);

  if (isCorrect) {
    playSuccessChime();
    appState.blitzScore++;
    appState.blitzStreak++;
    
    // Increment timer by +2s (cap at 15s)
    appState.blitzTimeRemaining = Math.min(15, appState.blitzTimeRemaining + 2);
    
    loadBlitzPuzzle();
  } else {
    playFailureClick();
    appState.blitzStreak = 0;
    
    const errorSq = input.includes("-") ? input.split("-")[0] : input;
    blitzBoard.shakeSquare(errorSq);

    // Subtract 1 second penalty
    appState.blitzTimeRemaining = Math.max(0, appState.blitzTimeRemaining - 1);
    updateBlitzStats();
  }
}

function updateBlitzStats() {
  dom.blitzScoreVal.innerText = appState.blitzScore;
  dom.blitzStreakVal.innerText = appState.blitzStreak;
  dom.blitzHighScoreVal.innerText = appState.blitzHighScore;
}

function startBlitzTimer() {
  stopBlitzTimer();
  updateTimerUI();

  appState.blitzTimerId = setInterval(() => {
    appState.blitzTimeRemaining--;
    updateTimerUI();

    // Sound warning under 4 seconds remaining
    if (appState.blitzTimeRemaining > 0 && appState.blitzTimeRemaining <= 3) {
      playBlitzWarningTick();
    }

    if (appState.blitzTimeRemaining <= 0) {
      stopBlitzTimer();
      handleBlitzGameOver();
    }
  }, 1000);
}

function stopBlitzTimer() {
  if (appState.blitzTimerId) {
    clearInterval(appState.blitzTimerId);
    appState.blitzTimerId = null;
  }
}

function updateTimerUI() {
  dom.blitzTimer.innerText = `${appState.blitzTimeRemaining}s`;

  // Update SVG timer ring circle dashoffset
  // dasharray is 283 (circumference)
  const limit = 10;
  const pct = Math.max(0, appState.blitzTimeRemaining / limit);
  const offset = 283 * (1 - pct);
  dom.blitzTimerRing.style.strokeDashoffset = offset;

  // Color coding
  if (appState.blitzTimeRemaining > 5) {
    dom.blitzTimerRing.style.stroke = "var(--neon-green)";
  } else if (appState.blitzTimeRemaining > 3) {
    dom.blitzTimerRing.style.stroke = "var(--neon-gold)";
  } else {
    dom.blitzTimerRing.style.stroke = "var(--neon-orange)";
  }
}

function handleBlitzGameOver() {
  playBlitzGameOver();
  
  if (appState.blitzScore > appState.blitzHighScore) {
    appState.blitzHighScore = appState.blitzScore;
    localStorage.setItem("chess_xray_blitz_highscore", appState.blitzHighScore);
  }

  dom.victoryTitle.innerText = "Blitz Game Over!";
  dom.victoryStats.innerHTML = `
    <p>Final Score: <strong>${appState.blitzScore}</strong> puzzles</p>
    <p>Max Streak: <strong>${appState.blitzStreak}</strong></p>
    <p>High Score: <strong>${appState.blitzHighScore}</strong></p>
  `;

  dom.victoryActionBtn.innerText = "Play Again";
  dom.victoryActionBtn.onclick = () => {
    startEndlessBlitz();
  };

  dom.victoryModal.style.display = "flex";
  dom.backdropOverlay.classList.add("active");
}

/**
 * Handle application X-Ray toggles
 */
function updateXRayState() {
  const active = appState.isXRayActive;

  if (active) {
    dom.xrayToggleBtn.classList.add("active");
    dom.xrayToggleBtn.querySelector(".toggle-label").innerText = "X-Ray: ON";
  } else {
    dom.xrayToggleBtn.classList.remove("active");
    dom.xrayToggleBtn.querySelector(".toggle-label").innerText = "X-Ray: OFF";
  }

  landingBoard.setXRayActive(active);
  playBoard.setXRayActive(active);
  blitzBoard.setXRayActive(active);
}

/**
 * Toggle slide drawer for tipping panel
 */
function toggleTippingPanel(open) {
  if (open) {
    if (!dom.tippingPanel.classList.contains("active")) {
      dom.tippingPanel.classList.add("active");
      dom.backdropOverlay.classList.add("active");
      playDrawerSweep(true);
    }
  } else {
    if (dom.tippingPanel.classList.contains("active")) {
      dom.tippingPanel.classList.remove("active");
      dom.backdropOverlay.classList.remove("active");
      playDrawerSweep(false);
    }
  }
}

function closeAllModals() {
  dom.victoryModal.style.display = "none";
  dom.backdropOverlay.classList.remove("active");
  toggleTippingPanel(false);
}

/**
 * Local Storage Persistence
 */
function saveProgress() {
  localStorage.setItem("chess_xray_progress", JSON.stringify(appState.completedLevels));
}

function loadProgress() {
  try {
    const saved = localStorage.getItem("chess_xray_progress");
    if (saved) {
      appState.completedLevels = JSON.parse(saved);
    }
    const high = localStorage.getItem("chess_xray_blitz_highscore");
    if (high) {
      appState.blitzHighScore = parseInt(high, 10);
    }
  } catch (err) {
    console.error("Failed to load progress from localStorage", err);
  }
}

/**
 * Radial bursting particle confetti canvas effect
 */
function triggerConfetti() {
  const canvas = dom.confettiCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Resize canvas to parent boundaries
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const particles = [];
  const colors = [
    "hsl(145, 100%, 50%)", // neon green
    "hsl(200, 100%, 50%)", // neon blue
    "hsl(45, 100%, 50%)",  // gold
    "hsl(25, 100%, 50%)",  // neon orange
    "hsl(320, 100%, 50%)"  // pink
  ];
  const shapes = ["circle", "square", "triangle", "ribbon"];

  // Double the particle count for a richer burst!
  const particleCount = 140;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 5;
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 20,
      vx: Math.cos(angle) * speed * 0.8,
      vy: (Math.sin(angle) * speed - 6) * 0.7, // Bias upwards
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      alpha: 1,
      decay: Math.random() * 0.012 + 0.006,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * Math.PI,
      wobbleSpeed: Math.random() * 0.15 + 0.05
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      // Apply physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.24; // Gravity
      p.vx *= 0.98; // Air resistance
      p.vy *= 0.98;
      
      p.alpha -= p.decay;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      // Wind oscillation
      p.x += Math.sin(p.wobble) * 0.6;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size / 2;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Apply 3D tilt wobble
        const scaleX = Math.sin(p.wobble);

        ctx.beginPath();
        if (p.shape === "circle") {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-p.size * scaleX / 2, -p.size / 2, p.size * scaleX, p.size);
        } else if (p.shape === "triangle") {
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(-p.size * scaleX / 2, p.size / 2);
          ctx.lineTo(p.size * scaleX / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.beginPath();
          ctx.moveTo(-p.size * scaleX, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size * scaleX, p.size);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    if (active && dom.victoryModal.style.display !== "none") {
      requestAnimationFrame(frame);
    }
  }

  frame();
}

// Bootstrap
window.addEventListener("DOMContentLoaded", initApp);
