import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integration-supabase/client';
import { GameState, Position, PieceType, makeMove, createInitialGameState, parseTimeControl } from '@/lib/chess';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderName: string;
  message: string;
  isSpectator: boolean;
  createdAt: string;
}

interface Room {
  id: string;
  playerCode: string;
  spectatorCode: string;
  timeControl: string;
  allowSpectators: boolean;
  playerWhiteId: string | null;
  playerBlackId: string | null;
  gameState: GameState;
}

interface UseGameRoomOptions {
  roomCode: string;
  playerName: string;
  isSpectator?: boolean;
}

export function useGameRoom({ roomCode, playerName, isSpectator = false }: UseGameRoomOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substr(2, 9)}`);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to find room by player code or spectator code
      const { data: rooms, error: fetchError } = await supabase
        .from('chess_rooms')
        .select('*')
        .or(`player_code.eq.${roomCode},spectator_code.eq.${roomCode}`);

      if (fetchError) throw fetchError;

      if (!rooms || rooms.length === 0) {
        setError('Room not found');
        return;
      }

      const roomData = rooms[0];
      const isPlayerCode = roomData.player_code === roomCode;
      
      // Parse game state
      let parsedGameState: GameState;
      if (roomData.game_state && typeof roomData.game_state === 'object') {
        const gs = roomData.game_state as Record<string, unknown>;
        parsedGameState = {
          board: gs.board as GameState['board'] || createInitialGameState(roomData.time_control).board,
          turn: (gs.turn as 'white' | 'black') || 'white',
          status: (gs.status as GameState['status']) || 'waiting',
          moves: (gs.moves as GameState['moves']) || [],
          whiteTime: (gs.whiteTime as number) || 600,
          blackTime: (gs.blackTime as number) || 600,
          lastMove: gs.lastMove as GameState['lastMove'],
          enPassantTarget: gs.enPassantTarget as GameState['enPassantTarget'],
          winner: gs.winner as GameState['winner'],
        };
      } else {
        parsedGameState = createInitialGameState(roomData.time_control);
      }

      const room: Room = {
        id: roomData.id,
        playerCode: roomData.player_code,
        spectatorCode: roomData.spectator_code,
        timeControl: roomData.time_control,
        allowSpectators: roomData.allow_spectators,
        playerWhiteId: roomData.player_white_id,
        playerBlackId: roomData.player_black_id,
        gameState: parsedGameState,
      };

      // Assign player color if joining as player
      if (isPlayerCode && !isSpectator) {
        let color: 'white' | 'black' | null = null;
        
        if (!roomData.player_white_id) {
          // Join as white
          await supabase
            .from('chess_rooms')
            .update({ player_white_id: playerId })
            .eq('id', roomData.id);
          color = 'white';
          room.playerWhiteId = playerId;
        } else if (roomData.player_white_id === playerId) {
          color = 'white';
        } else if (!roomData.player_black_id) {
          // Join as black
          await supabase
            .from('chess_rooms')
            .update({ player_black_id: playerId })
            .eq('id', roomData.id);
          color = 'black';
          room.playerBlackId = playerId;
        } else if (roomData.player_black_id === playerId) {
          color = 'black';
        } else {
          // Room is full, join as spectator
          setError('Room is full');
          return;
        }
        
        setPlayerColor(color);
      }

      setRoom(room);
      setGameState(parsedGameState);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomCode, playerId, isSpectator]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!room) return;

    const { data, error: fetchError } = await supabase
      .from('chess_messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return;
    }

    setMessages(data?.map(m => ({
      id: m.id,
      senderName: m.sender_name,
      message: m.message,
      isSpectator: m.is_spectator,
      createdAt: m.created_at,
    })) || []);
  }, [room]);

  // Make a chess move
  const makeChessMove = useCallback(async (from: Position, to: Position, promotion?: PieceType) => {
    if (!room || !gameState || !playerColor) return false;

    // Validate it's player's turn
    if (gameState.turn !== playerColor) {
      toast.error('Not your turn');
      return false;
    }

    const newState = makeMove(gameState, from, to, promotion);
    if (!newState) {
      toast.error('Invalid move');
      return false;
    }

    // Update local state immediately
    setGameState(newState);

    // Update database
    const { error: updateError } = await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    if (updateError) {
      console.error('Error updating game:', updateError);
      toast.error('Failed to save move');
      setGameState(gameState); // Rollback
      return false;
    }

    return true;
  }, [room, gameState, playerColor]);

  // Handle timeout (flag fall)
  const handleTimeout = useCallback(async (loser: 'white' | 'black') => {
    if (!room || !gameState || gameState.status !== 'playing') return;

    const winner = loser === 'white' ? 'black' : 'white';
    const newState: GameState = {
      ...gameState,
      status: 'checkmate', // Using checkmate status for timeout win
      winner,
    };

    setGameState(newState);

    await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    toast.info(`${winner === 'white' ? 'White' : 'Black'} wins on time!`);
  }, [room, gameState]);

  // Handle resign
  const handleResign = useCallback(async () => {
    if (!room || !gameState || !playerColor || gameState.status !== 'playing') return;

    const winner = playerColor === 'white' ? 'black' : 'white';
    const newState: GameState = {
      ...gameState,
      status: 'resigned',
      winner,
    };

    setGameState(newState);

    const { error: updateError } = await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    if (updateError) {
      console.error('Error resigning:', updateError);
      toast.error('Failed to resign');
      return;
    }

    toast.info(`${playerColor === 'white' ? 'White' : 'Black'} resigned. ${winner === 'white' ? 'White' : 'Black'} wins!`);
  }, [room, gameState, playerColor]);

  // Handle offer draw
  const handleOfferDraw = useCallback(async () => {
    if (!room || !gameState || !playerColor || gameState.status !== 'playing') return;

    // Check if there's already a pending draw offer
    if (gameState.drawOffer) {
      toast.error('There is already a pending draw offer');
      return;
    }

    const newState: GameState = {
      ...gameState,
      drawOffer: playerColor,
    };

    setGameState(newState);

    const { error: updateError } = await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    if (updateError) {
      console.error('Error offering draw:', updateError);
      toast.error('Failed to offer draw');
      return;
    }

    toast.info('Draw offer sent to opponent');
  }, [room, gameState, playerColor]);

  // Handle accept draw
  const handleAcceptDraw = useCallback(async () => {
    if (!room || !gameState || !playerColor || gameState.status !== 'playing') return;

    const newState: GameState = {
      ...gameState,
      status: 'draw',
      winner: undefined,
      drawOffer: undefined,
    };

    setGameState(newState);

    const { error: updateError } = await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    if (updateError) {
      console.error('Error accepting draw:', updateError);
      toast.error('Failed to accept draw');
      return;
    }

    toast.info('Draw accepted! Game ended in a draw.');
  }, [room, gameState, playerColor]);

  // Handle decline draw
  const handleDeclineDraw = useCallback(async () => {
    if (!room || !gameState || !playerColor || gameState.status !== 'playing') return;

    const newState: GameState = {
      ...gameState,
      drawOffer: undefined,
    };

    setGameState(newState);

    const { error: updateError } = await supabase
      .from('chess_rooms')
      .update({
        game_state: JSON.parse(JSON.stringify(newState)),
      })
      .eq('id', room.id);

    if (updateError) {
      console.error('Error declining draw:', updateError);
      toast.error('Failed to decline draw');
      return;
    }

    toast.info('Draw offer declined. Game continues.');
  }, [room, gameState, playerColor]);

  // Send a chat message
  const sendMessage = useCallback(async (message: string) => {
    if (!room || !message.trim()) return false;

    const { error: insertError } = await supabase
      .from('chess_messages')
      .insert({
        room_id: room.id,
        sender_name: playerName,
        message: message.trim(),
        is_spectator: isSpectator || !playerColor,
      });

    if (insertError) {
      console.error('Error sending message:', insertError);
      toast.error('Failed to send message');
      return false;
    }

    return true;
  }, [room, playerName, isSpectator, playerColor]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chess_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const newData = payload.new as Record<string, unknown>;
          if (newData.game_state) {
            const gs = newData.game_state as Record<string, unknown>;
            setGameState({
              board: gs.board as GameState['board'],
              turn: (gs.turn as 'white' | 'black') || 'white',
              status: (gs.status as GameState['status']) || 'waiting',
              moves: (gs.moves as GameState['moves']) || [],
              whiteTime: (gs.whiteTime as number) || 600,
              blackTime: (gs.blackTime as number) || 600,
              lastMove: gs.lastMove as GameState['lastMove'],
              enPassantTarget: gs.enPassantTarget as GameState['enPassantTarget'],
              winner: gs.winner as GameState['winner'],
            });
          }
          if (newData.player_white_id !== room.playerWhiteId || newData.player_black_id !== room.playerBlackId) {
            setRoom(prev => prev ? {
              ...prev,
              playerWhiteId: newData.player_white_id as string | null,
              playerBlackId: newData.player_black_id as string | null,
            } : null);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chess_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          setMessages(prev => [...prev, {
            id: newMsg.id as string,
            senderName: newMsg.sender_name as string,
            message: newMsg.message as string,
            isSpectator: newMsg.is_spectator as boolean,
            createdAt: newMsg.created_at as string,
          }]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [room]);

  // Initial data fetch
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (room) {
      fetchMessages();
    }
  }, [room, fetchMessages]);

  return {
    room,
    gameState,
    messages,
    loading,
    error,
    playerColor,
    isSpectator: isSpectator || !playerColor,
    makeMove: makeChessMove,
    sendMessage,
    playerId,
    opponentJoined: Boolean(room?.playerWhiteId && room?.playerBlackId),
    handleTimeout,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    drawOffer: gameState?.drawOffer,
  };
}
