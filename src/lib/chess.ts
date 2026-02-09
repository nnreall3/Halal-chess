// Chess Game Logic - Complete implementation with all rules

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'kingside' | 'queenside';
  enPassant?: boolean;
  notation?: string;
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  status: 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  moves: Move[];
  whiteTime: number;
  blackTime: number;
  lastMove?: Move;
  enPassantTarget?: Position;
  winner?: PieceColor;
  drawOffer?: PieceColor; // Which player offered the draw
}

// Initialize a standard chess board
export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }

  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }

  return board;
}

export function createInitialGameState(timeControl: string = '10+0'): GameState {
  const [minutes] = timeControl.split('+').map(Number);
  const timeInSeconds = (minutes || 10) * 60;
  
  return {
    board: createInitialBoard(),
    turn: 'white',
    status: 'waiting',
    moves: [],
    whiteTime: timeInSeconds,
    blackTime: timeInSeconds,
  };
}

// Deep clone the board
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

// Get piece at position
export function getPiece(board: Board, pos: Position): Square {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

// Check if position is valid
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

// Get all possible moves for a piece (without considering check)
function getRawMoves(board: Board, pos: Position, enPassantTarget?: Position): Position[] {
  const piece = getPiece(board, pos);
  if (!piece) return [];

  const moves: Position[] = [];
  const { row, col } = pos;
  const direction = piece.color === 'white' ? -1 : 1;

  switch (piece.type) {
    case 'pawn': {
      // Forward move
      const forward = { row: row + direction, col };
      if (isValidPosition(forward) && !getPiece(board, forward)) {
        moves.push(forward);
        // Double move from starting position
        const startRow = piece.color === 'white' ? 6 : 1;
        if (row === startRow) {
          const doubleForward = { row: row + 2 * direction, col };
          if (!getPiece(board, doubleForward)) {
            moves.push(doubleForward);
          }
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const capturePos = { row: row + direction, col: col + dc };
        if (isValidPosition(capturePos)) {
          const target = getPiece(board, capturePos);
          if (target && target.color !== piece.color) {
            moves.push(capturePos);
          }
          // En passant
          if (enPassantTarget && capturePos.row === enPassantTarget.row && capturePos.col === enPassantTarget.col) {
            moves.push(capturePos);
          }
        }
      }
      break;
    }
    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const newPos = { row: row + dr, col: col + dc };
        if (isValidPosition(newPos)) {
          const target = getPiece(board, newPos);
          if (!target || target.color !== piece.color) {
            moves.push(newPos);
          }
        }
      }
      break;
    }
    case 'bishop': {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        addSlidingMoves(board, pos, dr, dc, piece.color, moves);
      }
      break;
    }
    case 'rook': {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        addSlidingMoves(board, pos, dr, dc, piece.color, moves);
      }
      break;
    }
    case 'queen': {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        addSlidingMoves(board, pos, dr, dc, piece.color, moves);
      }
      break;
    }
    case 'king': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newPos = { row: row + dr, col: col + dc };
          if (isValidPosition(newPos)) {
            const target = getPiece(board, newPos);
            if (!target || target.color !== piece.color) {
              moves.push(newPos);
            }
          }
        }
      }
      // Castling
      if (!piece.hasMoved) {
        // Kingside castling
        const kingsideRook = getPiece(board, { row, col: 7 });
        if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved) {
          if (!getPiece(board, { row, col: 5 }) && !getPiece(board, { row, col: 6 })) {
            if (!isSquareAttacked(board, { row, col: 4 }, piece.color) &&
                !isSquareAttacked(board, { row, col: 5 }, piece.color) &&
                !isSquareAttacked(board, { row, col: 6 }, piece.color)) {
              moves.push({ row, col: 6 });
            }
          }
        }
        // Queenside castling
        const queensideRook = getPiece(board, { row, col: 0 });
        if (queensideRook?.type === 'rook' && !queensideRook.hasMoved) {
          if (!getPiece(board, { row, col: 1 }) && !getPiece(board, { row, col: 2 }) && !getPiece(board, { row, col: 3 })) {
            if (!isSquareAttacked(board, { row, col: 4 }, piece.color) &&
                !isSquareAttacked(board, { row, col: 3 }, piece.color) &&
                !isSquareAttacked(board, { row, col: 2 }, piece.color)) {
              moves.push({ row, col: 2 });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

function addSlidingMoves(board: Board, pos: Position, dr: number, dc: number, color: PieceColor, moves: Position[]) {
  let r = pos.row + dr;
  let c = pos.col + dc;
  
  while (isValidPosition({ row: r, col: c })) {
    const target = getPiece(board, { row: r, col: c });
    if (!target) {
      moves.push({ row: r, col: c });
    } else {
      if (target.color !== color) {
        moves.push({ row: r, col: c });
      }
      break;
    }
    r += dr;
    c += dc;
  }
}

// Find king position
function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// Check if a square is attacked by the opponent
function isSquareAttacked(board: Board, pos: Position, defenderColor: PieceColor): boolean {
  const attackerColor = defenderColor === 'white' ? 'black' : 'white';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === attackerColor) {
        const moves = getRawMoves(board, { row, col });
        if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if the king is in check
export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, color);
}

// Get all legal moves for a piece (considering check)
export function getLegalMoves(board: Board, pos: Position, enPassantTarget?: Position): Position[] {
  const piece = getPiece(board, pos);
  if (!piece) return [];

  const rawMoves = getRawMoves(board, pos, enPassantTarget);
  const legalMoves: Position[] = [];

  for (const move of rawMoves) {
    const testBoard = cloneBoard(board);
    // Make the move on test board
    testBoard[move.row][move.col] = { ...piece, hasMoved: true };
    testBoard[pos.row][pos.col] = null;

    // Handle en passant capture
    if (piece.type === 'pawn' && enPassantTarget && 
        move.row === enPassantTarget.row && move.col === enPassantTarget.col) {
      const capturedPawnRow = piece.color === 'white' ? move.row + 1 : move.row - 1;
      testBoard[capturedPawnRow][move.col] = null;
    }

    // Check if this move leaves the king in check
    if (!isInCheck(testBoard, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

// Make a move and return the new game state
export function makeMove(state: GameState, from: Position, to: Position, promotion?: PieceType): GameState | null {
  const piece = getPiece(state.board, from);
  if (!piece || piece.color !== state.turn) return null;

  const legalMoves = getLegalMoves(state.board, from, state.enPassantTarget);
  if (!legalMoves.some(m => m.row === to.row && m.col === to.col)) {
    return null;
  }

  const newBoard = cloneBoard(state.board);
  const captured = getPiece(newBoard, to);
  
  // Create move record
  const move: Move = {
    from,
    to,
    piece: { ...piece },
    captured: captured || undefined,
  };

  // Handle special moves
  let newEnPassantTarget: Position | undefined;

  // Castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const isKingside = to.col > from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    newBoard[from.row][rookToCol] = { ...newBoard[from.row][rookFromCol]!, hasMoved: true };
    newBoard[from.row][rookFromCol] = null;
    move.castling = isKingside ? 'kingside' : 'queenside';
  }

  // En passant capture
  if (piece.type === 'pawn' && state.enPassantTarget &&
      to.row === state.enPassantTarget.row && to.col === state.enPassantTarget.col) {
    const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    move.captured = newBoard[capturedPawnRow][to.col] || undefined;
    newBoard[capturedPawnRow][to.col] = null;
    move.enPassant = true;
  }

  // Set en passant target for double pawn move
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
  }

  // Pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: promotion || 'queen', color: piece.color, hasMoved: true };
    move.promotion = promotion || 'queen';
  } else {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  }
  
  newBoard[from.row][from.col] = null;

  // Generate move notation
  move.notation = generateNotation(state.board, move);

  const nextTurn = state.turn === 'white' ? 'black' : 'white';
  
  // Check game status
  let status = state.status;
  let winner: PieceColor | undefined;
  
  if (status === 'waiting') {
    status = 'playing';
  }

  // Check for checkmate or stalemate
  let hasLegalMoves = false;
  outer: for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = newBoard[row][col];
      if (p?.color === nextTurn) {
        const moves = getLegalMoves(newBoard, { row, col }, newEnPassantTarget);
        if (moves.length > 0) {
          hasLegalMoves = true;
          break outer;
        }
      }
    }
  }

  if (!hasLegalMoves) {
    if (isInCheck(newBoard, nextTurn)) {
      status = 'checkmate';
      winner = state.turn;
    } else {
      status = 'stalemate';
    }
  }

  return {
    ...state,
    board: newBoard,
    turn: nextTurn,
    status,
    moves: [...state.moves, move],
    lastMove: move,
    enPassantTarget: newEnPassantTarget,
    winner,
  };
}

// Generate algebraic notation for a move
function generateNotation(board: Board, move: Move): string {
  const piece = move.piece;
  const files = 'abcdefgh';
  const toFile = files[move.to.col];
  const toRank = 8 - move.to.row;

  if (move.castling === 'kingside') return 'O-O';
  if (move.castling === 'queenside') return 'O-O-O';

  let notation = '';

  if (piece.type !== 'pawn') {
    const pieceLetters: Record<PieceType, string> = {
      king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: ''
    };
    notation += pieceLetters[piece.type];
  }

  if (move.captured || move.enPassant) {
    if (piece.type === 'pawn') {
      notation += files[move.from.col];
    }
    notation += 'x';
  }

  notation += toFile + toRank;

  if (move.promotion) {
    const promoLetters: Record<PieceType, string> = {
      king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: ''
    };
    notation += '=' + promoLetters[move.promotion];
  }

  return notation;
}

// Parse time control string (e.g., "10+5" = 10 minutes + 5 seconds increment)
export function parseTimeControl(timeControl: string): { minutes: number; increment: number } {
  const parts = timeControl.split('+').map(Number);
  return {
    minutes: parts[0] || 10,
    increment: parts[1] || 0,
  };
}

// Format time for display (seconds to MM:SS)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
