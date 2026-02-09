-- Create chess rooms table for multiplayer games
CREATE TABLE public.chess_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_code TEXT NOT NULL UNIQUE,
  spectator_code TEXT NOT NULL UNIQUE,
  time_control TEXT NOT NULL DEFAULT '10+0',
  allow_spectators BOOLEAN NOT NULL DEFAULT true,
  player_white_id TEXT,
  player_black_id TEXT,
  game_state JSONB DEFAULT '{"board": null, "turn": "white", "status": "waiting", "moves": [], "whiteTime": 600, "blackTime": 600}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table for room chat
CREATE TABLE public.chess_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chess_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_spectator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chess_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chess_rooms - allow public access for anonymous games
CREATE POLICY "Anyone can view rooms" 
ON public.chess_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create rooms" 
ON public.chess_rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update rooms" 
ON public.chess_rooms 
FOR UPDATE 
USING (true);

-- RLS policies for chat messages
CREATE POLICY "Anyone can view messages in rooms" 
ON public.chess_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can send messages" 
ON public.chess_messages 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chess_rooms_updated_at
BEFORE UPDATE ON public.chess_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_messages;