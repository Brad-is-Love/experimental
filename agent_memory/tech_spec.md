# Technical Architecture Design: Chess X-Ray

This document outlines the **Technical Design Document (TDD)** for the Chess X-Ray (Skeletal Trainer) client-side application. It defines the folder structure, data models, modular interfaces, FEN parsing logic, visual overlay implementations, audio synthesizer design, and development commands to enable a single-pass, error-free implementation.

---

## 1. System Architecture Overview

Chess X-Ray is designed as a **100% client-side, zero-dependency Single Page Application (SPA)**. To adhere to the strict autonomy mandate, it runs without any server-side database or processing, allowing it to be hosted on Nginx, Traefik, or GitHub Pages at $0 operating cost.

```
+-----------------------------------------------------------------------------+
|                                  BROWSER                                    |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |                              HTML (DOM)                               |  |
|  |   #app Container                                                      |  |
|  |   ├── Header & Stats                                                  |  |
|  |   ├── View Screens (Landing, Play, Endless)                           |  |
|  |   ├── SVG Board & HUD                                                 |  |
|  |   └── Victory / Tipping Modals                                        |  |
|  +-----------------------------------+-----------------------------------+  |
|                                      | (State updates trigger renders)      |
|                                      v                                      |
|  +-----------------------------------------------------------------------+  |
|  |                       JavaScript Application Modules                  |  |
|  |                                                                       |  |
|  |    +--------------+      +----------------+      +----------------+   |  |
|  |    |    app.js    | ---> |    board.js    | ---> |    audio.js    |   |  |
|  |    |  (Orches-    |      | (FEN Parser &  |      | (Web Audio API |   |  |
|  |    |   trator &   |      |  SVG Renderer) |      | Synthesizer)   |   |  |
|  |    |   State)     |      +--------+-------+      +----------------+   |  |
|  |    +-------+------+               |                                   |  |
|  |            |                      v                                   |  |
|  |            |             +--------+-------+                           |  |
|  |            +------------>|  database.js   |                           |  |
|  |                          | (Syllabus &    |                           |  |
|  |                          |  Blitz Puzzles)|                           |  |
|  |                          +----------------+                           |  |
|  +-----------------------------------------------------------------------+  |
|                                      |                                      |
|                                      v                                      |
|  +-----------------------------------------------------------------------+  |
|  |                               CSS STYLING                             |  |
|  |  * Custom HSL Variable Themes                                         |  |
|  |  * Glassmorphism and Backdrop Filters                                 |  |
|  |  * Chessboard grid, SVG Overlay arrows, pulse outposts                |  |
|  |  * X-Ray Transitions (.piece.non-structural { opacity: 0.15 })        |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## 2. Directory & File Layout

All source files will reside in the `chess_tool/` directory at the root of the workspace.

```
chess_tool/
├── index.html       # Single Page Application HTML shell and SVG piece definitions
├── style.css        # Vanilla CSS style system, animations, and transitions
├── app.js           # Core state management, view controller, and event handlers
├── board.js         # Modular chessboard renderer, FEN parser, and interaction layer
├── database.js      # Static puzzle and syllabus data
└── audio.js         # Web Audio API real-time sound synthesizer
```

---

## 3. Data Model Specifications

The application state is central and flows top-down. Data structures are strictly defined in JSON/JS Object notation.

### 3.1 Application State Schema
Managed in `app.js` as a mutable global store:

```javascript
const appState = {
  viewState: 'LANDING',            // 'LANDING' | 'SYLLABUS_PLAY' | 'BLITZ_PLAY' | 'LEVEL_COMPLETE'
  activeLevelId: null,             // null | 1 | 2 | 3 | 4
  activeStageIndex: 0,             // Number (0-indexed)
  isXRayActive: true,              // Boolean
  hintUsed: false,                 // Boolean

  // Endless Blitz Mode State
  blitzTimeRemaining: 10,          // Number (seconds)
  blitzScore: 0,                   // Number
  blitzStreak: 0,                  // Number
  blitzHighScore: 0,               // Number (persisted in localStorage)
  blitzActivePositionIndex: 0,     // Number (index in endless dataset)
  blitzTimerId: null,              // null | IntervalID

  // Interaction tracking
  selectedSquare: null,            // null | 'e4' | 'c6' etc.
  completedStages: {},             // Map: { [levelId]: stageIndexCompleted }
  answersLogged: []                // Array of objects tracking logs: { levelId, stageIndex, correct, timestamp }
};
```

### 3.2 Syllabus Data Schema (`database.js`)
The dataset exported by `database.js` conforms to the following structure:

```typescript
interface XRayOverlay {
  chains?: string[][];        // Array of chain paths, e.g. [["d4", "e3", "f2"], ["c3", "b2"]]
  weaknesses?: string[];      // Squares to glow orange/red, e.g. ["c6", "d4"]
  outposts?: string[];        // Squares to pulse green target rings, e.g. ["c5", "d5"]
  openFiles?: string[];       // Letters representing files, e.g. ["c", "e"]
  levers?: string[];          // Pawn moves to highlight with gold arrows, e.g. ["b4-b5"]
}

interface Stage {
  type: 'CLICK_WEAKNESS' | 'CLICK_OUTPOST' | 'MOVE_PAWN' | 'PLAN_SELECTION';
  question: string;
  correctTarget: string;      // E.g. 'c6', 'c5', 'b4-b5', or option index '1'
  options?: string[];         // Only populated when type === 'PLAN_SELECTION'
  successText: string;
  failureText: string;        // Text shown as hint/guidance
  xrayHighlights: XRayOverlay;
}

interface Level {
  id: number;                 // 1 | 2 | 3 | 4
  title: string;
  concept: string;
  fen: string;                // Initial board FEN
  stages: Stage[];
}
```

---

## 4. Module Interfaces & Boundaries

### 4.1 `database.js`
*   **Purpose**: Houses all raw level configurations and Endless Blitz data.
*   **API**:
    ```javascript
    export const SYLLABUS_LEVELS = [ ... ]; // Array of Level objects
    export const ENDLESS_PUZZLES = [ ... ];  // Array of Stage objects
    ```

### 4.2 `audio.js`
*   **Purpose**: Synthetic sound generation bypassing external audio asset loading.
*   **API**:
    ```javascript
    // Initializes the AudioContext upon first user interaction (browser security requirement)
    export function initAudio();
    
    // Play the success chime arpeggio (Triangle wave: E5 -> G5 -> C6)
    export function playSuccessChime();
    
    // Play the failure click (Sine wave drop from 120Hz to 60Hz)
    export function playFailureClick();
    
    // Play the hologram hum on X-Ray activation (Sawtooth low-pass sweep: 100Hz -> 150Hz)
    export function playBootHum();
    ```

### 4.3 `board.js`
*   **Purpose**: Manages the chessboard rendering, coordinates inputs, parses FEN strings, handles dragging, and draws visual overlay highlights.
*   **API**:
    ```javascript
    export class ChessBoardRenderer {
      /**
       * @param {HTMLElement} containerEl - The wrapper element for the board (#board-container)
       */
      constructor(containerEl);

      /**
       * Render board configuration based on FEN
       * @param {string} fen 
       */
      loadFEN(fen);

      /**
       * Enable/disable the visual X-Ray filter
       * @param {boolean} active 
       */
      setXRayActive(active);

      /**
       * Render the glowing overlays
       * @param {XRayOverlay} overlays 
       */
      applyOverlays(overlays);

      /**
       * Clear all overlays, arrows, and custom indicators
       */
      clearOverlays();

      /**
       * Register click callback on a board square
       * @param {function(string)} callback - Receives clicked square coordinate e.g. 'c6'
       */
      onSquareClick(callback);

      /**
       * Register move callback (for drag-and-drop or click-click)
       * @param {function(string, string)} callback - Receives fromSquare, toSquare e.g. 'b4', 'b5'
       */
      onMoveMade(callback);

      /**
       * Highlight specific squares for a visual hint
       * @param {string[]} squares 
       */
      showHintSquares(squares);
    }
    ```

### 4.4 `app.js`
*   **Purpose**: Core application controller. Binds view templates, handles state transitions, updates statistics, runs the Endless Blitz countdown timer, and hooks the DOM.
*   **Key Functions**:
    ```javascript
    function initApp();             // Bootstraps event listeners and renders Landing Hub
    function navigateTo(viewState); // Manages screen navigation, toggling hidden states
    function loadStage(levelId, stageIndex); // Updates state, resets HUD, loads board
    function handleSquareClick(square); // Evaluates player answer for clicks
    function handleMoveMade(from, to); // Evaluates player answer for pawn moves
    function handlePlanSelect(index); // Evaluates multiple-choice plan clicks
    function startBlitzTimer();    // Manages the 10-second endless countdown
    function renderApp();           // Synchronizes HTML UI elements with state variables
    ```

---

## 5. Key Implementation Details

### 5.1 FEN Parser & Board Geometry
To draw the board, a lightweight parser inside `board.js` maps FEN strings to coordinates:
*   The board is represented internally as an $8 \times 8$ grid.
*   Columns $0$ through $7$ map to files `a` through `h`.
*   Ranks $0$ through $7$ map to ranks `8` down to `1` (visual top-down layout).
*   FEN decoding reads characters:
    *   `/` advances to the next rank.
    *   Numbers `1-8` skip empty cells.
    *   Letters define the pieces: `P`/`p` (Pawn), `N`/`n` (Knight), `B`/`b` (Bishop), `R`/`r` (Rook), `Q`/`q` (Queen), `K`/`k` (King). Upper case = White, Lower case = Black.

### 5.2 Responsive CSS Board Grid
The board is drawn as a responsive CSS Grid:
```css
#board-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 500px;
  margin: 0 auto;
}
.chessboard {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 4px solid var(--panel-bg);
}
```

### 5.3 High-Juice SVG Piece Definitions
Standardizing chess pieces via high-quality SVG `<defs>` inside `index.html` keeps files clean.
A piece is rendered dynamically as:
```html
<div class="piece [type] [color] [structural-class]" data-square="c6" draggable="true">
  <svg viewBox="0 0 45 45">
    <use href="#[color]-[type]"></use>
  </svg>
</div>
```
#### Structural vs Non-Structural Classification
*   **Structural**: Pawns (`p`), Kings (`k`), and any blocking pieces designated by the stage.
*   **Non-Structural**: Queens, Rooks, Bishops, Knights (except target/blocking pieces).
*   CSS rule handling:
```css
.piece {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s, transform 0.2s;
  cursor: grab;
}
.xray-active .piece.non-structural {
  opacity: 0.15;
  filter: drop-shadow(0 0 2px var(--neon-blue)) grayscale(100%);
  pointer-events: none; /* Disable interaction with faded tactical noise */
}
```

### 5.4 Overlay Layer Drawing (SVG Paths)
Overlaid vectors (pawn chains and lever arrows) are drawn dynamically on an SVG canvas positioned absolutely over the chessboard:
```html
<svg class="overlay-svg" viewBox="0 0 800 800" style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
  <!-- Rendered dynamically by board.js -->
</svg>
```
*   Square coordinates are converted to grid-relative percentages (e.g. `c6` ➔ column 2, rank 2 ➔ center coordinates `x: 31.25%`, `y: 31.25%`).
*   **Pawn chains** are drawn as `<polyline>` elements with custom dasharrays and glowing dropshadows.
*   **Pawn levers** are drawn as `<path>` lines ending in marker arrowhead definitions (`#arrowhead-gold`).

---

## 6. View State Transition & Rendering Loop

The SPA uses a target-based toggle layout. All screens are initialized in the DOM and toggled using `display: none` / `active` class modifiers.

```css
.screen-view {
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.screen-view.active {
  display: grid; /* or flex/block */
  opacity: 1;
}
```

### 6.1 State Reducer / Updates
All interactions pass through handlers that modify `appState` and then call `renderApp()`.
```javascript
function updateState(updaterFn) {
  updaterFn(appState);
  renderApp();
}
```
*   `renderApp()` handles:
    1.  Toggling screen visibility classes based on `viewState`.
    2.  Refreshing HUD text elements (current level, stage instructions, progress bar).
    3.  Updating the Blitz score indicators and streaks.
    4.  Rendering modal overlays (`victory-modal`, `tipping-panel`).
    5.  Saving completed stages back to `localStorage` for progress persistence.

---

## 7. Build, Run, & Verification Plan

### 7.1 Development Server
Since the code is standard HTML5/ES Modules, it can be tested locally using any zero-dependency static file server.
*   **Launch Command**:
    ```bash
    python3 -m http.server 8080 --directory chess_tool/
    ```
    or
    ```bash
    npx -y serve -l 8080 chess_tool/
    ```

### 7.2 Manual Verification Points (Phase 8 Gate)
1.  **FTUE Test**: Ensure landing page triggers a boot-up hum and fades pieces when clicking the glowing "X-Ray Mode" toggle.
2.  **Responsiveness Test**: Verify chessboard stays square and responsive on simulated mobile viewports (e.g., iPhone SE/12 width `375px`).
3.  **Endless Blitz Timer**: Verify timer turns Orange at 5s, Red at 3s, and successfully increments by +2s on correct click, ending in a victory modal when hitting 0s.
4.  **Tipping Drawer**: Click `[Tips]` in the header to verify drawer slides in smoothly from the right edge.
