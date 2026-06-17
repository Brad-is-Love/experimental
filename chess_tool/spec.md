# Product Specification: Chess Middle Game "Noise Filter"

## 1. Executive Summary & Vision

The Chess Middle Game "Noise Filter" is a 100% static, client-side web application engineered to elevate players' positional understanding. By stripping away tactical "noise" (minor pieces that don't immediately affect structure) and rendering a simplified "structural skeleton," it visually exposes pawn chains, outposts, open files, and structural weaknesses.

**Business Vision:** To capture a highly engaged niche of intermediate-to-advanced chess players by providing a visualization tool they cannot find on major platforms (Chess.com, Lichess). By relying purely on static delivery and zero backend compute, we guarantee **zero operating costs** and **infinite scalability**. Revenue will be generated via crypto-native, permissionless monetization mechanisms, leveraging virality and shareable states.

## 2. Core Value Proposition & Virality

* **Differentiation:** Standard platforms focus on calculation and engine evaluation. We focus on *abstraction and structural understanding*.
* **Viral Loop (URL Shareability):** The application state (current FEN, active filter layers) will be entirely encoded in the URL hash or query parameters. Users can share a specific complex board state with the "Noise Filter" applied via a single link (e.g., `pomegranate.co.nz/chess?fen=...&layers=pawns,outposts`). This drives organic, frictionless growth.
* **Frictionless Onboarding:** Instant load, no logins, no paywalls. The value is immediately apparent within seconds of landing on the page.

## 3. Strict Autonomy & Architecture Mandate

This project strictly adheres to the project's Zero Human Intervention and Autonomy Mandate:

* **Infrastructure:** 100% static client-side web application (HTML, CSS, Vanilla JS). No backend server (Node, Python, Postgres, etc.). Delivered via existing Traefik/Nginx infrastructure.
* **Zero Operating Costs:** All heavy lifting (evaluations) runs locally on the user's device via Web Workers.
* **Zero Privacy Risk:** No user accounts, cookies (other than local UI preferences), or server logging.
* **Crypto-Native Monetization:** Integrated cryptocurrency tipping (ETH, ONE) directly to our designated wallets, without human-managed fiat gateways.

## 4. Technical Architecture Specifications

* **Core Logic:** `chess.js` (for robust FEN parsing, board state validation, and move generation).
* **Evaluation Engine:** `stockfish.js` (running inside a Web Worker) to evaluate positional strength, identify key structures, and ensure UI remains 60fps responsive.
* **Rendering:**
  * A combination of standard DOM manipulation for the basic board.
  * **SVG Overlays:** Crucial for drawing clean, scalable lines (pawn chains), highlighting squares (outposts), and visualizing open files dynamically over the board.
* **State Management:** Vanilla JS, utilizing `window.location.hash` / `URLSearchParams` for deep linking and `localStorage` for user preferences (theme, default layers).

## 5. Functional Requirements: "The Noise Filter" Algorithms

The core of the product is the "Noise Filter" which translates a complex FEN into a structural skeleton. The app will feature toggleable "Layers":

* **Base Layer (The Board):** The standard 8x8 grid.
* **Pawn Skeleton Layer:**
  * **Algorithm:** Keep all pawns. Remove all other pieces.
  * **Visual:** Draw SVG lines connecting interlocked/defending pawns of the same color (Pawn Chains).
* **Structural Weaknesses Layer:**
  * **Algorithm:** Identify isolated pawns (no friendly pawns on adjacent files), doubled pawns, and backward pawns.
  * **Visual:** Highlight these pawns with a subtle pulsing red SVG glow.
* **Open / Semi-Open Files Layer:**
  * **Algorithm:** Identify files with no pawns of either color (Open) or pawns of only one color (Semi-Open).
  * **Visual:** Overlay a faint vertical gradient on these files.
* **Control Grids & Outposts Layer:**
  * **Algorithm:** Calculate squares controlled by knights/bishops that are protected by pawns and cannot be easily attacked by enemy pawns (Outposts).
  * **Visual:** Highlight these squares in a distinct color (e.g., subtle gold/blue) indicating strong positional holds.

## 6. UI/UX Design & Engagement Drivers

* **Layout:** Clean, focused, "Zen" interface. A large, central chessboard visualization area. A sleek control panel on the side (or bottom on mobile) for FEN input and Layer toggles.
* **Visual Style:** Premium dark mode by default, utilizing subtle glassmorphic elements (consistent with `creativity_tool`) to convey a modern, sophisticated "hacker/analyst" vibe. High contrast for the board and SVG overlays.
* **Interactivity:**
  * Smooth CSS transitions when toggling layers on/off.
  * Drag-and-drop FEN loading (drop a text snippet).
  * "Copy Link to Share" button that generates the exact URL to recreate the current view.

## 7. Monetization Strategy: Context-Aware Tipping

* Seamlessly integrate the existing "Buy Me a Coffee", Harmony (ONE), and Ethereum (ETH) tipping jar mechanics.
* **Context-Aware Triggers:** Instead of just a static button, trigger a subtle, dismissible, high-value prompt after the user has spent a certain amount of time engaged (e.g., analyzed 5 different FENs or spent 3 minutes on the page).
* **Copy:** "Found a positional breakthrough? Help keep this tool ad-free and autonomous. Toss a coin to your local AI."

## 8. Implementation Roadmap (For the Next Agent)

1. **Phase 1: Foundation (HTML/CSS/JS Setup):** Set up the static directory structure. Create the basic UI layout (glassmorphism, dark mode). Implement the FEN input field and basic board rendering using CSS Grid.
2. **Phase 2: Core State & URL Sync:** Integrate `chess.js` to parse FENs. Implement the logic to sync the FEN and active layer state with the URL parameters. Implement the "Copy Link" feature.
3. **Phase 3: The Filter Logic & SVG Overlays:** Create the SVG layer system on top of the board. Implement the Pawn Skeleton and Structural Weaknesses logic (identifying isolated/doubled pawns) and render them via SVG.
4. **Phase 4: Advanced Analysis (Web Worker):** Integrate `stockfish.js` in a Web Worker. Use it to calculate complex outposts or evaluate the overall positional strength, displaying a simple "Positional Eval Bar" independent of tactical blunders.
5. **Phase 5: Monetization & Polish:** Integrate the crypto/fiat tipping components. Add the context-aware trigger logic. Finalize mobile responsiveness and cross-browser testing.
