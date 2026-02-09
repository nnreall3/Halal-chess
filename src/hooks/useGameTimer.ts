import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integration-supabase/client';
import { GameState, parseTimeControl } from '@/lib/chess';
interface UseGameTimerOptions {
  roomId: string | null;
  gameState: GameState | null;
  playerColor: 'white' | 'black' | null;
  timeControl: string;
  onTimeout?: (loser: 'white' | 'black') => void;
}
export function useGameTimer({
  roomId,
  gameState,
  playerColor,
  timeControl,
  onTimeout,
}: UseGameTimerOptions) {
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const { increment } = parseTimeControl(timeControl);
  // Initialize times from game state
  useEffect(() => {
    if (gameState) {
      setWhiteTime(gameState.whiteTime);
      setBlackTime(gameState.blackTime);
    }
  }, [gameState?.whiteTime, gameState?.blackTime]);
  // Timer countdown logic
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Only run timer when game is actively playing
    if (!gameState || gameState.status !== 'playing' || !roomId) {
      return;
    }
    lastUpdateRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdateRef.current) / 1000);
      
      if (elapsed < 1) return;
      
      lastUpdateRef.current = now;
      if (gameState.turn === 'white') {
        setWhiteTime(prev => {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0 && prev > 0) {
            onTimeout?.('white');
          }
          return newTime;
        });
      } else {
        setBlackTime(prev => {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0 && prev > 0) {
            onTimeout?.('black');
          }
          return newTime;
        });
      }
    }, 100); // Update every 100ms for smooth display
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameState?.status, gameState?.turn, roomId, onTimeout]);
  // Sync timer to database periodically and after moves
  const syncTimerToDb = useCallback(async () => {
    if (!roomId || !gameState || gameState.status !== 'playing') return;
    const updatedState = {
      ...gameState,
      whiteTime,
      blackTime,
    };
    await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(updatedState)),
      })
      .eq('id', roomId);
  }, [roomId, gameState, whiteTime, blackTime]);
  // Add increment after a move
  const addIncrement = useCallback((color: 'white' | 'black') => {
    if (increment > 0) {
      if (color === 'white') {
        setWhiteTime(prev => prev + increment);
      } else {
        setBlackTime(prev => prev + increment);
      }
    }
  }, [increment]);
  return {
    whiteTime,
    blackTime,
    syncTimerToDb,
    addIncrement,
  };
}