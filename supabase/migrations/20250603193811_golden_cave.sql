/*
  # Create messages and games tables

  1. New Tables
    - messages
      - id (uuid, primary key)
      - room_id (uuid, references rooms)
      - user_id (uuid, references profiles)
      - content (text)
      - is_system_message (boolean)
      - created_at (timestamptz)
    
    - games
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - min_players (integer)
      - max_players (integer)
      - players (jsonb)
      - status (text)
      - started_at (timestamptz)
      - ended_at (timestamptz)
      - winner_id (uuid, references profiles)
      - board_state (jsonb)
      - current_player (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_system_message boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Messages are viewable by everyone"
  ON public.messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  min_players integer NOT NULL,
  max_players integer NOT NULL,
  players jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'waiting',
  started_at timestamptz,
  ended_at timestamptz,
  winner_id uuid REFERENCES public.profiles(id),
  board_state jsonb,
  current_player text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies for games
CREATE POLICY "Games are viewable by everyone"
  ON public.games
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert games"
  ON public.games
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Game participants can update games"
  ON public.games
  FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT jsonb_array_elements_text(players)
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();