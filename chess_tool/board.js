// board.js
// Handles FEN parsing, SVG rendering of pieces, drag-and-drop, and glowing visual overlays

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

function isStructuralPiece(type) {
  return type === "p" || type === "k";
}

export class ChessBoardRenderer {
  /**
   * @param {HTMLElement} containerEl - The wrapper element for the board (#board-container)
   */
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.chessboardEl = null;
    this.overlaySvgEl = null;
    
    this.clickCallback = null;
    this.moveCallback = null;
    this.selectedSquare = null;
    
    this.initDOM();
  }

  /**
   * Set up board container elements
   */
  initDOM() {
    this.containerEl.innerHTML = "";
    this.containerEl.style.position = "relative";

    // 1. Create Chessboard Grid
    const board = document.createElement("div");
    board.className = "chessboard";
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement("div");
        const isDark = (r + c) % 2 === 1;
        const squareName = files[c] + ranks[r];
        sq.className = `square ${isDark ? "dark" : "light"}`;
        sq.dataset.square = squareName;
        board.appendChild(sq);
      }
    }
    this.chessboardEl = board;
    this.containerEl.appendChild(board);

    // 2. Create SVG Overlay Canvas
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "overlay-svg");
    svg.setAttribute("viewBox", "0 0 800 800");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "10";
    this.overlaySvgEl = svg;
    this.containerEl.appendChild(svg);

    this.bindEvents();
  }

  /**
   * Bind event handlers for click, drag-and-drop
   */
  bindEvents() {
    // Square click event delegation
    this.chessboardEl.addEventListener("click", (e) => {
      const squareEl = e.target.closest(".square");
      if (!squareEl) return;
      const square = squareEl.dataset.square;

      // Trigger click callback
      if (this.clickCallback) {
        this.clickCallback(square);
      }

      // Handle selection logic for click-to-move
      const pieceEl = squareEl.querySelector(".piece");
      if (pieceEl) {
        if (this.selectedSquare && this.selectedSquare !== square) {
          // Attempt move
          if (this.moveCallback) {
            this.moveCallback(this.selectedSquare, square);
          }
          this.clearSelection();
        } else {
          // Select piece
          this.clearSelection();
          this.selectedSquare = square;
          squareEl.classList.add("selected-square");
        }
      } else {
        // Clicked an empty square
        if (this.selectedSquare) {
          if (this.moveCallback) {
            this.moveCallback(this.selectedSquare, square);
          }
          this.clearSelection();
        }
      }
    });

    // Drag-over allowance on squares
    this.chessboardEl.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    // Drop handler on squares
    this.chessboardEl.addEventListener("drop", (e) => {
      e.preventDefault();
      const squareEl = e.target.closest(".square");
      if (!squareEl) return;
      const toSquare = squareEl.dataset.square;
      const fromSquare = e.dataTransfer.getData("text/plain");

      if (fromSquare && fromSquare !== toSquare) {
        if (this.moveCallback) {
          this.moveCallback(fromSquare, toSquare);
        }
      }
      this.clearSelection();
    });
  }

  /**
   * Render board configuration based on FEN
   * @param {string} fen
   */
  loadFEN(fen) {
    this.clearOverlays();
    this.clearSelection();

    // Clear squares
    const squares = this.chessboardEl.querySelectorAll(".square");
    squares.forEach((sq) => {
      sq.innerHTML = "";
    });

    const boardPart = fen.split(" ")[0];
    const rows = boardPart.split("/");

    for (let r = 0; r < 8; r++) {
      const rowStr = rows[r];
      let c = 0;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (isNaN(char)) {
          const type = char.toLowerCase();
          const color = char === char.toUpperCase() ? "w" : "b";
          const squareName = files[c] + ranks[r];

          const squareEl = this.chessboardEl.querySelector(`[data-square="${squareName}"]`);
          if (squareEl) {
            const pieceEl = document.createElement("div");
            pieceEl.className = `piece ${color}-${type} ${isStructuralPiece(type) ? "structural" : "non-structural"}`;
            pieceEl.dataset.square = squareName;
            pieceEl.dataset.type = type;
            pieceEl.dataset.color = color;
            pieceEl.draggable = true;

            const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgEl.setAttribute("viewBox", "0 0 45 45");
            const useEl = document.createElementNS("http://www.w3.org/2000/svg", "use");
            useEl.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${color}-${type}`);
            
            svgEl.appendChild(useEl);
            pieceEl.appendChild(svgEl);

            // Drag Events
            pieceEl.addEventListener("dragstart", (e) => {
              e.dataTransfer.setData("text/plain", squareName);
              pieceEl.classList.add("dragging");
            });
            pieceEl.addEventListener("dragend", () => {
              pieceEl.classList.remove("dragging");
            });

            squareEl.appendChild(pieceEl);
          }
          c++;
        } else {
          c += parseInt(char, 10);
        }
      }
    }
  }

  /**
   * Set dynamic active state of the visual X-Ray filter class
   * @param {boolean} active
   */
  setXRayActive(active) {
    if (active) {
      this.chessboardEl.classList.add("xray-active");
    } else {
      this.chessboardEl.classList.remove("xray-active");
    }
  }

  /**
   * Classify pieces dynamically based on overlays configuration
   * @param {object} overlays
   */
  applyOverlays(overlays) {
    this.clearOverlays();
    if (!overlays) return;

    // Classify pieces dynamically: pieces on weaknesses/outposts are treated as structural (100% opacity)
    const pieces = this.chessboardEl.querySelectorAll(".piece");
    pieces.forEach((pieceEl) => {
      const square = pieceEl.dataset.square;
      const type = pieceEl.dataset.type;
      const isAlwaysStructural = isStructuralPiece(type);
      const isHighlighted = (overlays.weaknesses && overlays.weaknesses.includes(square)) ||
                           (overlays.outposts && overlays.outposts.includes(square));

      if (isAlwaysStructural || isHighlighted) {
        pieceEl.classList.remove("non-structural");
        pieceEl.classList.add("structural");
      } else {
        pieceEl.classList.remove("structural");
        pieceEl.classList.add("non-structural");
      }
    });
  }

  /**
   * Reset/clear overlays
   */
  clearOverlays() {
    this.overlaySvgEl.innerHTML = "";
    const squares = this.chessboardEl.querySelectorAll(".square");
    squares.forEach((sq) => {
      sq.classList.remove("hint-pulse", "selected-square", "shake-animation");
    });
  }

  /**
   * Clear active selection
   */
  clearSelection() {
    this.selectedSquare = null;
    const squares = this.chessboardEl.querySelectorAll(".square");
    squares.forEach((sq) => {
      sq.classList.remove("selected-square");
    });
  }

  /**
   * Highlight squares for hints
   * @param {string[]} squares
   */
  showHintSquares(squares) {
    squares.forEach((sq) => {
      const el = this.chessboardEl.querySelector(`[data-square="${sq}"]`);
      if (el) {
        el.classList.add("hint-pulse");
      }
    });
  }

  /**
   * Apply incorrect shake animation to a square
   * @param {string} square
   */
  shakeSquare(square) {
    const el = this.chessboardEl.querySelector(`[data-square="${square}"]`);
    if (el) {
      el.classList.remove("shake-animation");
      void el.offsetWidth; // Trigger DOM reflow to restart animation
      el.classList.add("shake-animation");
    }
  }

  /**
   * Click event hook
   * @param {function} callback
   */
  onSquareClick(callback) {
    this.clickCallback = callback;
  }

  /**
   * Move completed event hook
   * @param {function} callback
   */
  onMoveMade(callback) {
    this.moveCallback = callback;
  }
}
