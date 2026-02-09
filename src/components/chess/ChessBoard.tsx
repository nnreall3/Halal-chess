import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Board, Position, getLegalMoves, PieceType } from '@/lib/chess';
import { ChessPiece } from './ChessPieces';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  board: Board;
  turn: 'white' | 'black';
  playerColor?: 'white' | 'black' | null;
  lastMove?: { from: Position; to: Position };
  enPassantTarget?: Position;
  onMove?: (from: Position, to: Position, promotion?: PieceType) => void;
  disabled?: boolean;
  flipped?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  playerColor,
  lastMove,
  enPassantTarget,
  onMove,
  disabled = false,
  flipped = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [promotionSquare, setPromotionSquare] = useState<{ from: Position; to: Position } | null>(null);

  const isFlipped = flipped || playerColor === 'black';

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (disabled || (playerColor && playerColor !== turn)) {
      return;
    }

    const pos = { row, col };
    const piece = board[row][col];

    // If we have a selected piece and clicking on a legal move
    if (selectedSquare && legalMoves.some(m => m.row === row && m.col === col)) {
      const selectedPiece = board[selectedSquare.row][selectedSquare.col];
      
      // Check for pawn promotion
      if (selectedPiece?.type === 'pawn' && (row === 0 || row === 7)) {
        setPromotionSquare({ from: selectedSquare, to: pos });
        return;
      }
      
      onMove?.(selectedSquare, pos);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If clicking on own piece, select it
    if (piece && piece.color === turn && (!playerColor || piece.color === playerColor)) {
      setSelectedSquare(pos);
      const moves = getLegalMoves(board, pos, enPassantTarget);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [board, selectedSquare, legalMoves, turn, playerColor, disabled, enPassantTarget, onMove]);

  const handlePromotion = (pieceType: PieceType) => {
    if (promotionSquare) {
      onMove?.(promotionSquare.from, promotionSquare.to, pieceType);
      setPromotionSquare(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Memoize board rendering for performance
  const boardSquares = useMemo(() => {
    const squares: React.ReactNode[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const actualRow = isFlipped ? 7 - row : row;
        const actualCol = isFlipped ? 7 - col : col;
        
        const isLight = (actualRow + actualCol) % 2 === 0;
        const piece = board[actualRow][actualCol];
        const isSelected = selectedSquare?.row === actualRow && selectedSquare?.col === actualCol;
        const isLegalMove = legalMoves.some(m => m.row === actualRow && m.col === actualCol);
        const isLastMoveFrom = lastMove?.from.row === actualRow && lastMove?.from.col === actualCol;
        const isLastMoveTo = lastMove?.to.row === actualRow && lastMove?.to.col === actualCol;
        const showRowLabel = col === 0;
        const showColLabel = row === 7;

        squares.push(
          <div
            key={`${actualRow}-${actualCol}`}
            className={cn(
              'relative flex items-center justify-center aspect-square cursor-pointer select-none will-change-transform',
              isLight ? 'bg-board-light' : 'bg-board-dark',
              isSelected && 'ring-4 ring-inset ring-primary/70',
              (isLastMoveFrom || isLastMoveTo) && !isSelected && 'ring-2 ring-inset ring-accent/50',
              disabled ? 'cursor-default' : 'active:scale-95'
            )}
            onClick={() => handleSquareClick(actualRow, actualCol)}
          >
            {/* Coordinate labels */}
            {showRowLabel && (
              <span className={cn(
                'absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold pointer-events-none z-10',
                isLight ? 'text-board-dark/70' : 'text-board-light/70'
              )}>
                {8 - actualRow}
              </span>
            )}
            {showColLabel && (
              <span className={cn(
                'absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold pointer-events-none z-10',
                isLight ? 'text-board-dark/70' : 'text-board-light/70'
              )}>
                {String.fromCharCode(97 + actualCol)}
              </span>
            )}

            {/* Legal move indicator - dot for empty squares */}
            {isLegalMove && !piece && (
              <div className="absolute w-[28%] h-[28%] rounded-full bg-primary/40 shadow-lg z-20 animate-in fade-in zoom-in-50 duration-150" />
            )}

            {/* Capture indicator - ring around enemy piece */}
            {isLegalMove && piece && (
              <div className="absolute inset-[6%] rounded-full ring-[4px] ring-destructive/60 z-10 animate-in fade-in duration-150" />
            )}

            {/* Chess piece */}
            {piece && (
              <div className="w-[85%] h-[85%] flex items-center justify-center drop-shadow-md z-30 transform-gpu">
                <ChessPiece 
                  type={piece.type} 
                  color={piece.color} 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        );
      }
    }
    return squares;
  }, [board, isFlipped, selectedSquare, legalMoves, lastMove, disabled, handleSquareClick]);

  return (
    <div className="relative w-full max-w-[min(500px,95vw)] sm:max-w-[min(500px,85vw)] mx-auto">
      {/* Board container with premium styling */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
        {/* Decorative border */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none z-40 rounded-xl" />
        
        {/* The board grid */}
        <div className="grid grid-cols-8 aspect-square">
          {boardSquares}
        </div>
      </div>

      {/* Promotion dialog */}
      {promotionSquare && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl animate-in fade-in duration-150">
          <div className="bg-card p-6 rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-150">
            <p className="text-center text-base font-medium text-foreground mb-4">Choose promotion piece</p>
            <div className="flex gap-3">
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handlePromotion(type)}
                  className="p-3 rounded-xl bg-secondary hover:bg-primary/20 active:scale-95 border border-border/50 transition-transform shadow-md"
                >
                  <ChessPiece type={type} color={turn} className="w-10 h-10" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
