const PIECE_UNICODE = {
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

let game = new Chess();
let boardEl = null;
let svgOverlay = null;
let fenInput = null;
let fenChangeCount = 0;
let tippingDismissed = false;

function initBoard() {
    boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    svgOverlay = document.getElementById('svg-overlay');
    // Create 64 squares
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');

        // Calculate rank and file (0-7)
        // chess.js board representation: A8 is [0][0], H1 is [7][7]
        // But let's build the DOM top-to-bottom, left-to-right (A8 to H1)
        const row = Math.floor(i / 8);
        const col = i % 8;

        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        square.dataset.index = i;
        boardEl.appendChild(square);
    }
}

function drawPawnSkeleton(boardState) {
    const squareSize = svgOverlay.clientWidth / 8;

    // Find all pawns
    const pawns = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] && boardState[r][c].type === 'p') {
                pawns.push({ r, c, color: boardState[r][c].color });
            }
        }
    }

    // Draw chains (pawns defending pawns of same color)
    pawns.forEach(pawn => {
        const direction = pawn.color === 'w' ? -1 : 1; // white moves up (-r), black down (+r)
        const defendR = pawn.r + direction;

        // Check diagonal left and right for defending
        [-1, 1].forEach(dc => {
            const defendC = pawn.c + dc;
            if (defendR >= 0 && defendR < 8 && defendC >= 0 && defendC < 8) {
                const target = boardState[defendR][defendC];
                if (target && target.type === 'p' && target.color === pawn.color) {
                    // Draw line from pawn to target
                    const x1 = pawn.c * squareSize + squareSize / 2;
                    const y1 = pawn.r * squareSize + squareSize / 2;
                    const x2 = defendC * squareSize + squareSize / 2;
                    const y2 = defendR * squareSize + squareSize / 2;

                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", x1);
                    line.setAttribute("y1", y1);
                    line.setAttribute("x2", x2);
                    line.setAttribute("y2", y2);
                    line.classList.add("pawn-chain-link");
                    svgOverlay.appendChild(line);
                }
            }
        });
    });
}

function updateBoard() {
    const boardState = game.board(); // Returns 8x8 array or null for empty
    const squares = boardEl.querySelectorAll('.square');

    const isPawnSkeletonActive = document.getElementById('layer-pawn-skeleton').checked;
    const isWeaknessesActive = document.getElementById('layer-structural-weaknesses').checked;
    const isOpenFilesActive = document.getElementById('layer-open-files').checked;
    const isOutpostsActive = document.getElementById('layer-outposts').checked;

    // Clear SVG but keep defs
    const defs = svgOverlay.querySelector('defs');
    svgOverlay.innerHTML = '';
    if (defs) svgOverlay.appendChild(defs);

    // Pre-calculate structural weaknesses if active
    let weakPawns = new Set();
    if (isWeaknessesActive) {
        weakPawns = calculateStructuralWeaknesses(boardState);
    }

    let outposts = new Set();
    if (isOutpostsActive) {
        outposts = calculateOutposts(boardState);
    }

    squares.forEach((squareEl, index) => {
        squareEl.innerHTML = ''; // Clear square
        squareEl.className = 'square ' + ( (Math.floor(index/8) + index%8) % 2 === 0 ? 'light' : 'dark' );

        const row = Math.floor(index / 8);
        const col = index % 8;
        const piece = boardState[row][col];

        if (isWeaknessesActive && weakPawns.has(`${row},${col}`)) {
            squareEl.classList.add('weakness-glow');
        }

        if (isOutpostsActive && outposts.has(`${row},${col}`)) {
            squareEl.classList.add('outpost-glow');
        }

        if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.classList.add('piece');

            if (isPawnSkeletonActive && piece.type !== 'p') {
                pieceEl.classList.add('hidden-piece');
            }

            // Using standard text characters for pieces initially to avoid needing image assets immediately
            const pieceChar = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
            pieceEl.textContent = PIECE_UNICODE[pieceChar];
            // Style the text piece to fit
            pieceEl.style.display = 'flex';
            pieceEl.style.justifyContent = 'center';
            pieceEl.style.alignItems = 'center';
            pieceEl.style.color = piece.color === 'w' ? '#fff' : '#000';
            pieceEl.style.textShadow = piece.color === 'w' ? '0 0 2px #000' : '0 0 2px #fff';

            squareEl.appendChild(pieceEl);
        }
    });

    if (isPawnSkeletonActive) {
        drawPawnSkeleton(boardState);
    }

    if (isOpenFilesActive) {
        drawOpenFiles(boardState);
    }
}

function drawOpenFiles(boardState) {
    const squareSize = svgOverlay.clientWidth / 8;
    const files = Array(8).fill(null).map(() => ({ wPawn: false, bPawn: false }));

    // Scan board for pawns
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (piece && piece.type === 'p') {
                if (piece.color === 'w') files[c].wPawn = true;
                if (piece.color === 'b') files[c].bPawn = true;
            }
        }
    }

    files.forEach((fileInfo, c) => {
        const isOpen = !fileInfo.wPawn && !fileInfo.bPawn;
        const isSemiOpen = (fileInfo.wPawn && !fileInfo.bPawn) || (!fileInfo.wPawn && fileInfo.bPawn);

        if (isOpen || isSemiOpen) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", c * squareSize);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", squareSize);
            rect.setAttribute("height", svgOverlay.clientHeight);
            rect.classList.add(isOpen ? "open-file-rect" : "semi-open-file-rect");

            // If semi-open for white (white pawn missing), gradient goes up (we could flip it, but standard is fine)
            // Just draw it for now
            svgOverlay.insertBefore(rect, svgOverlay.firstChild); // draw behind pieces
        }
    });
}

function calculateStructuralWeaknesses(boardState) {
    const weak = new Set();

    // Find all pawns
    const pawns = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] && boardState[r][c].type === 'p') {
                pawns.push({ r, c, color: boardState[r][c].color });
            }
        }
    }

    pawns.forEach(pawn => {
        let isIsolated = true;
        let isDoubled = false;
        let isBackward = true; // Simplified backward check

        const dir = pawn.color === 'w' ? -1 : 1;

        // Check doubled (same color pawn on same file, in front or behind)
        pawns.forEach(other => {
            if (other.c === pawn.c && other.r !== pawn.r && other.color === pawn.color) {
                isDoubled = true;
            }
        });

        // Check isolated (no same color pawns on adjacent files)
        const hasAdjacentFilePawn = pawns.some(other =>
            other.color === pawn.color && Math.abs(other.c - pawn.c) === 1
        );
        if (hasAdjacentFilePawn) isIsolated = false;

        // Simplified Backward: Has pawns on adjacent files, but they are all further advanced
        // meaning this pawn cannot be defended by them if it moves forward.
        if (!isIsolated) {
            const adjacentPawns = pawns.filter(other =>
                other.color === pawn.color && Math.abs(other.c - pawn.c) === 1
            );

            const canBeDefended = adjacentPawns.some(other => {
                // If white (-dir is up), adjacent pawn must be at same rank or behind (r >= pawn.r)
                if (pawn.color === 'w') return other.r >= pawn.r;
                // If black (+dir is down), adjacent pawn must be at same rank or behind (r <= pawn.r)
                if (pawn.color === 'b') return other.r <= pawn.r;
                return false;
            });

            if (canBeDefended) {
                isBackward = false;
            } else {
                // Also need to check if the square in front is controlled by enemy pawn
                // to be truly considered 'backward' in a strict sense, but this is a decent heuristic.
                // We'll stick to the structural "left behind" definition.
            }
        } else {
            isBackward = false; // Isolated pawns are not considered backward
        }

        if (isIsolated || isDoubled || isBackward) {
            weak.add(`${pawn.r},${pawn.c}`);
        }
    });

    return weak;
}

function calculateOutposts(boardState) {
    const outposts = new Set();

    // Simplistic outpost evaluation:
    // 1. Must be occupied by a Knight or Bishop
    // 2. Must be protected by a friendly pawn
    // 3. Must NOT be attackable by an enemy pawn
    // Note: A true outpost definition is more complex, but this fits the "structural analyzer" vibe.

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (piece && (piece.type === 'n' || piece.type === 'b')) {
                const color = piece.color;
                const enemyColor = color === 'w' ? 'b' : 'w';
                const fDir = color === 'w' ? 1 : -1; // Pawn attacking direction (reversed because pawn is behind)

                // 1. Is it protected by a friendly pawn?
                let protectedByPawn = false;
                [-1, 1].forEach(dc => {
                    const pr = r + fDir;
                    const pc = c + dc;
                    if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
                        const p = boardState[pr][pc];
                        if (p && p.type === 'p' && p.color === color) {
                            protectedByPawn = true;
                        }
                    }
                });

                // 2. Can it be attacked by an enemy pawn?
                // Look ahead for enemy pawns that could move to attack this square
                let attackableByEnemyPawn = false;
                const eDir = color === 'w' ? -1 : 1; // Enemy pawn approaching direction

                // Look for enemy pawns on adjacent files that are strictly "in front" of this piece
                [-1, 1].forEach(dc => {
                    const ec = c + dc;
                    if (ec >= 0 && ec < 8) {
                        // Scan the adjacent file starting from the rank in front of the piece
                        let scanR = r + eDir;
                        while(scanR >= 0 && scanR < 8) {
                            const p = boardState[scanR][ec];
                            if (p && p.type === 'p' && p.color === enemyColor) {
                                attackableByEnemyPawn = true;
                                break;
                            }
                            scanR += eDir;
                        }
                    }
                });

                if (protectedByPawn && !attackableByEnemyPawn) {
                    outposts.add(`${r},${c}`);
                }
            }
        }
    }
    return outposts;
}

function handleCopyLink() {
    const btn = document.getElementById('copy-link-btn');
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function updateLayersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const layersParam = params.get('layers');
    if (layersParam) {
        const activeLayers = layersParam.split(',');
        document.querySelectorAll('.layer-toggle input').forEach(checkbox => {
            checkbox.checked = activeLayers.includes(checkbox.id.replace('layer-', ''));
        });
    }
}

function syncUrl() {
    const fen = game.fen();
    const params = new URLSearchParams(window.location.search);
    params.set('fen', fen);

    // Sync layers
    const activeLayers = Array.from(document.querySelectorAll('.layer-toggle input:checked'))
                              .map(cb => cb.id.replace('layer-', ''));
    if (activeLayers.length > 0) {
        params.set('layers', activeLayers.join(','));
    } else {
        params.delete('layers');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
}

function handleLayerToggle() {
    syncUrl();
    updateBoard(); // Re-render to apply/remove filters
}

function checkTippingTrigger() {
    if (!tippingDismissed && fenChangeCount >= 3) {
        const tippingSection = document.getElementById('tipping-section');
        tippingSection.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition if we wanted to get fancy
        setTimeout(() => {
            tippingSection.style.opacity = 1;
        }, 10);
    }
}

function handleFenChange(e) {
    const newFen = e.target.value.trim();
    if (game.validate_fen(newFen).valid) {
        game.load(newFen);
        updateBoard();
        syncUrl();
        fenChangeCount++;
        checkTippingTrigger();
    } else {
        console.error("Invalid FEN");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Chess Noise Filter Initialized');

    // Check URL for FEN
    const params = new URLSearchParams(window.location.search);
    const urlFen = params.get('fen');
    if (urlFen && game.validate_fen(urlFen).valid) {
        game.load(urlFen);
    }

    initBoard();
    updateBoard();
    syncUrl(); // Ensure URL reflects initial state

    fenInput = document.getElementById('fen-input');
    fenInput.value = game.fen();
    fenInput.addEventListener('change', handleFenChange);
    // Also update on keyup if it's a valid FEN, for smoother UX
    fenInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleFenChange(e);
    });

    document.getElementById('copy-link-btn').addEventListener('click', handleCopyLink);

    // Initialize layers from URL and add listeners
    updateLayersFromUrl();
    document.querySelectorAll('.layer-toggle input').forEach(checkbox => {
        checkbox.addEventListener('change', handleLayerToggle);
    });

    document.getElementById('close-tipping-btn').addEventListener('click', () => {
        tippingDismissed = true;
        document.getElementById('tipping-section').classList.add('hidden');
    });
});
