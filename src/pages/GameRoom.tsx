import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useGameTimer } from '@/hooks/useGameTimer';
import ChessBoard from '@/components/chess/ChessBoard';
import GameStatus from '@/components/chess/GameStatus';
import GameChat from '@/components/chess/GameChat';
import { Position, PieceType } from '@/lib/chess';

const GameRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { t, dir } = useLanguage();
  const [playerName] = useState(() => sessionStorage.getItem('chess-player-name') || 'Player');
  const [chatOpen, setChatOpen] = useState(false);

  const {
    room,
    gameState,
    messages,
    loading,
    error,
    playerColor,
    isSpectator,
    makeMove,
    sendMessage,
    opponentJoined,
    handleTimeout,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    drawOffer,
  } = useGameRoom({
    roomCode: roomCode || '',
    playerName,
    isSpectator: false,
  });

  // Use timer hook
  const { whiteTime, blackTime, addIncrement } = useGameTimer({
    roomId: room?.id || null,
    gameState,
    playerColor,
    timeControl: room?.timeControl || '10+0',
    onTimeout: handleTimeout,
  });

  // Handle window resize for chat visibility
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMove = async (from: Position, to: Position, promotion?: PieceType) => {
    const success = await makeMove(from, to, promotion);
    if (success && playerColor) {
      addIncrement(playerColor);
    }
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !room || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <p className="text-xl font-semibold text-destructive mb-4">
            {error || t('roomNotFound')}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background geometric-pattern" dir={dir}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('leaveGame')}
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {isSpectator && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {t('spectator')}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr,320px,300px] gap-6 items-start">
            {/* Chess Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[500px] mx-auto lg:max-w-none"
            >
              <ChessBoard
                board={gameState.board}
                turn={gameState.turn}
                playerColor={playerColor}
                lastMove={gameState.lastMove}
                enPassantTarget={gameState.enPassantTarget}
                onMove={handleMove}
                disabled={isSpectator || !opponentJoined || gameState.status !== 'playing' && gameState.status !== 'waiting'}
                flipped={playerColor === 'black'}
              />
              
              {/* Mobile status below board */}
              <div className="lg:hidden mt-6">
                <GameStatus
                  gameState={gameState}
                  playerColor={playerColor}
                  playerName={playerName}
                  opponentName={playerColor === 'white' ? 'Black' : 'White'}
                  whiteTime={whiteTime}
                  blackTime={blackTime}
                  onResign={handleResign}
                  onOfferDraw={handleOfferDraw}
                  onAcceptDraw={handleAcceptDraw}
                  onDeclineDraw={handleDeclineDraw}
                  drawOffer={drawOffer}
                />
              </div>
            </motion.div>

            {/* Game Status - Desktop */}
            <div className="hidden lg:block sticky top-24">
              <GameStatus
                gameState={gameState}
                playerColor={playerColor}
                playerName={playerName}
                opponentName={playerColor === 'white' ? 'Black' : 'White'}
                whiteTime={whiteTime}
                blackTime={blackTime}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
                onAcceptDraw={handleAcceptDraw}
                onDeclineDraw={handleDeclineDraw}
                drawOffer={drawOffer}
              />
            </div>

            {/* Chat - Desktop */}
            <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
              <GameChat
                messages={messages}
                onSendMessage={handleSendMessage}
                playerName={playerName}
                isOpen={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Chat */}
      {!isDesktop && (
        <GameChat
          messages={messages}
          onSendMessage={handleSendMessage}
          playerName={playerName}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
        />
      )}
    </div>
  );
};

export default GameRoom;
