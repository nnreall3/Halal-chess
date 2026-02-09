import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integration-supabase/client';
import { createInitialGameState } from '@/lib/chess';
import { toast } from 'sonner';

const TIME_CONTROLS = [
  { value: '1+0', label: '1 min (Bullet)' },
  { value: '3+0', label: '3 min (Blitz)' },
  { value: '3+2', label: '3+2 (Blitz)' },
  { value: '5+0', label: '5 min (Blitz)' },
  { value: '5+3', label: '5+3 (Blitz)' },
  { value: '10+0', label: '10 min (Rapid)' },
  { value: '10+5', label: '10+5 (Rapid)' },
  { value: '15+10', label: '15+10 (Rapid)' },
  { value: '30+0', label: '30 min (Classical)' },
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const CreateGame: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  
  const [playerName, setPlayerName] = useState('');
  const [timeControl, setTimeControl] = useState('10+0');
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roomCodes, setRoomCodes] = useState<{ player: string; spectator: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<'player' | 'spectator' | null>(null);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const playerCode = generateRoomCode();
      const spectatorCode = generateRoomCode();
      const gameState = createInitialGameState(timeControl);

      const { data, error } = await supabase
        .from('chess_rooms')
        .insert({
          player_code: playerCode,
          spectator_code: spectatorCode,
          time_control: timeControl,
          allow_spectators: allowSpectators,
          game_state: JSON.parse(JSON.stringify(gameState)),
        })
        .select()
        .single();

      if (error) throw error;

      setRoomCodes({ player: playerCode, spectator: spectatorCode });
      
      // Store player name for the game
      sessionStorage.setItem('chess-player-name', playerName.trim());
      
      toast.success('Room created successfully!');
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string, type: 'player' | 'spectator') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast.success(t('codeCopied'));
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const goToGame = () => {
    if (roomCodes) {
      navigate(`/game/${roomCodes.player}`);
    }
  };

  return (
    <div className="min-h-screen bg-background geometric-pattern" dir={dir}>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('gameSetup')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!roomCodes ? (
                <>
                  {/* Player Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('yourName')}</Label>
                    <Input
                      id="name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={20}
                    />
                  </div>

                  {/* Time Control */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('timeControl')}
                    </Label>
                    <Select value={timeControl} onValueChange={setTimeControl}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_CONTROLS.map((tc) => (
                          <SelectItem key={tc.value} value={tc.value}>
                            {tc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spectators */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="spectators">{t('allowSpectators')}</Label>
                    </div>
                    <Switch
                      id="spectators"
                      checked={allowSpectators}
                      onCheckedChange={setAllowSpectators}
                    />
                  </div>

                  {/* Create Button */}
                  <Button
                    onClick={handleCreate}
                    disabled={loading || !playerName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {t('createRoom')}
                  </Button>
                </>
              ) : (
                <>
                  {/* Room codes display */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        {t('playerCode')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-2xl font-mono font-bold tracking-widest text-primary">
                          {roomCodes.player}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyCode(roomCodes.player, 'player')}
                        >
                          {copiedCode === 'player' ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this code with your opponent to play
                      </p>
                    </div>

                    {allowSpectators && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {t('spectatorCode')}
                        </Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xl font-mono tracking-widest">
                            {roomCodes.spectator}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyCode(roomCodes.spectator, 'spectator')}
                          >
                            {copiedCode === 'spectator' ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Share this code with spectators
                        </p>
                      </div>
                    )}
                  </div>

                  <Button onClick={goToGame} className="w-full" size="lg">
                    {t('startGame')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateGame;
