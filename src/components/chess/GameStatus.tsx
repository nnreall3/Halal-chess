import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Crown, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameState, formatTime } from '@/lib/chess';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  gameState: GameState;
  playerColor: 'white' | 'black' | null;
  playerName: string;
  opponentName?: string;
  whiteTime?: number;
  blackTime?: number;
  onResign?: () => void;
  onOfferDraw?: () => void;
  onAcceptDraw?: () => void;
  onDeclineDraw?: () => void;
  drawOffer?: 'white' | 'black';
  className?: string;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  gameState,
  playerColor,
  playerName,
  opponentName = 'Opponent',
  whiteTime,
  blackTime,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  drawOffer,
  className,
}) => {
  const { t } = useLanguage();

  // Use provided times or fall back to gameState times
  const displayWhiteTime = whiteTime ?? gameState.whiteTime;
  const displayBlackTime = blackTime ?? gameState.blackTime;

  const isYourTurn = playerColor === gameState.turn;
  const isGameOver = ['checkmate', 'stalemate', 'draw', 'resigned'].includes(gameState.status);

  const getStatusMessage = () => {
    switch (gameState.status) {
      case 'waiting':
        return t('waitingForOpponent');
      case 'checkmate':
        return `${t('checkmate')} ${gameState.winner === 'white' ? t('whiteWins') : t('blackWins')}`;
      case 'stalemate':
        return t('stalemate');
      case 'draw':
        return t('draw');
      case 'resigned':
        return `${gameState.winner === 'white' ? t('whiteWins') : t('blackWins')}`;
      default:
        return playerColor ? (isYourTurn ? t('yourTurn') : t('opponentTurn')) : `${gameState.turn === 'white' ? t('white') : t('black')} ${t('moves').toLowerCase()}`;
    }
  };

  const PlayerCard: React.FC<{
    name: string;
    color: 'white' | 'black';
    time: number;
    isActive: boolean;
    isTop?: boolean;
  }> = ({ name, color, time, isActive, isTop }) => {
    const isLowTime = time < 60;
    
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg transition-all',
          isActive && gameState.status === 'playing' ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50',
          isTop ? 'mb-4' : 'mt-4',
          isLowTime && isActive && 'animate-pulse'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              color === 'white' ? 'bg-secondary text-secondary-foreground' : 'bg-foreground text-background'
            )}
          >
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{t(color)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={cn('w-4 h-4', isActive && gameState.status === 'playing' ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
          <span className={cn(
            'font-mono text-lg font-bold tabular-nums',
            isLowTime ? 'text-destructive' : isActive ? 'text-primary' : ''
          )}>
            {formatTime(time)}
          </span>
        </div>
      </div>
    );
  };

  const topPlayerColor = playerColor === 'white' ? 'black' : 'white';
  const bottomPlayerColor = playerColor || 'white';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('bg-card rounded-xl border border-border p-4 shadow-lg', className)}
    >
      {/* Top player (opponent or black) */}
      <PlayerCard
        name={playerColor ? opponentName : t('black')}
        color={topPlayerColor}
        time={topPlayerColor === 'white' ? displayWhiteTime : displayBlackTime}
        isActive={gameState.turn === topPlayerColor}
        isTop
      />

      {/* Status message */}
      <div className="py-4 text-center border-y border-border">
        {isGameOver && gameState.winner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-2"
          >
            <Crown className="w-8 h-8 mx-auto text-accent" />
          </motion.div>
        )}
        <motion.p
          key={gameState.status + gameState.turn}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'font-semibold',
            isGameOver ? 'text-lg' : 'text-base',
            isYourTurn && gameState.status === 'playing' && 'text-primary'
          )}
        >
          {getStatusMessage()}
        </motion.p>
        {gameState.moves.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('moves')}: {gameState.moves.length}
          </p>
        )}
      </div>

      {/* Bottom player (you or white) */}
      <PlayerCard
        name={playerColor ? playerName : t('white')}
        color={bottomPlayerColor}
        time={bottomPlayerColor === 'white' ? displayWhiteTime : displayBlackTime}
        isActive={gameState.turn === bottomPlayerColor}
      />

      {/* Draw Offer Received */}
      {drawOffer && drawOffer !== playerColor && playerColor && gameState.status === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg bg-accent/20 border border-accent/30"
        >
          <p className="text-sm font-medium text-center mb-3">
            {t('drawOfferReceived')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onAcceptDraw}
            >
              {t('accept')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onDeclineDraw}
            >
              {t('decline')}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Draw Offer Pending (sent by me) */}
      {drawOffer && drawOffer === playerColor && playerColor && gameState.status === 'playing' && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t('drawOfferPending')}
          </p>
        </div>
      )}

      {/* Actions */}
      {playerColor && gameState.status === 'playing' && !drawOffer && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onOfferDraw}
          >
            {t('offerDraw')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onResign}
          >
            <Flag className="w-4 h-4 mr-1" />
            {t('resign')}
          </Button>
        </div>
      )}

      {/* Only Resign when draw offer is pending */}
      {playerColor && gameState.status === 'playing' && drawOffer && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onResign}
          >
            <Flag className="w-4 h-4 mr-1" />
            {t('resign')}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default GameStatus;
