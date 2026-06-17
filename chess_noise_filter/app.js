document.addEventListener('DOMContentLoaded', () => {
  const fenInput = document.getElementById('fen-input');
  const loadBtn = document.getElementById('btn-load-fen');
  const noiseToggle = document.getElementById('noise-filter-toggle');
  const chessboard = document.getElementById('chessboard');

  let chess = new Chess();
  let isSkeletonView = false;

  const pieceUnicode = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
  };

  const pieceColors = {
    'k': 'black', 'q': 'black', 'r': 'black', 'b': 'black', 'n': 'black', 'p': 'black',
    'K': 'white', 'Q': 'white', 'R': 'white', 'B': 'white', 'N': 'white', 'P': 'white'
  };

  function renderBoard() {
    chessboard.innerHTML = '';
    const board = chess.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareDiv = document.createElement('div');
        squareDiv.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;

        const piece = board[row][col];
        if (piece) {
          const pieceSpan = document.createElement('span');
          const fenChar = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
          pieceSpan.textContent = pieceUnicode[fenChar];
          pieceSpan.className = `piece ${pieceColors[fenChar]}`;

          if (isSkeletonView) {
            // Filter out minor/major pieces (Noise), keep pawns and kings (Skeleton)
            if (!['p', 'P', 'k', 'K'].includes(fenChar)) {
              pieceSpan.classList.add('filtered');
            }
          }

          squareDiv.appendChild(pieceSpan);
        }

        chessboard.appendChild(squareDiv);
      }
    }
  }

  function loadFen() {
    const fen = fenInput.value.trim();
    if (chess.load(fen)) {
      renderBoard();
    } else {
      alert('Invalid FEN string.');
    }
  }

  loadBtn.addEventListener('click', loadFen);

  noiseToggle.addEventListener('change', (e) => {
    isSkeletonView = e.target.checked;
    renderBoard();
  });

  fenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadFen();
    }
  });

  // Initial render
  loadFen();
});
