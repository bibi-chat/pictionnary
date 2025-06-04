/*
  # Initial Schema Setup for Chat Room and Game Management Application

  1. Tables Created:
    - profiles (user profiles linked to auth.users)
    - rooms (chat rooms)
    - messages (chat messages)
    - games (game instances)

  2. Security:
    - RLS enabled on all tables
    - Policies for proper access control
    - Triggers for automatic timestamp updates

  3. Relationships:
    - profiles -> auth.users (1:1)
    - messages -> rooms (N:1)
    - messages -> profiles (N:1)
    - rooms -> profiles (N:1 for creator)
    - games -> profiles (N:1 for winner)
    - rooms -> games (1:1 for active game)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  moderators jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_private boolean DEFAULT false,
  game_active_id uuid,
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_system_message boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

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

-- Add foreign key from rooms to games after both tables exist
ALTER TABLE public.rooms 
  ADD CONSTRAINT rooms_game_active_id_fkey 
  FOREIGN KEY (game_active_id) 
  REFERENCES public.games(id) 
  ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Rooms policies
CREATE POLICY "Public rooms are viewable by everyone"
  ON public.rooms FOR SELECT
  USING (
    NOT is_private OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
  );

CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room members can update rooms"
  ON public.rooms FOR UPDATE
  USING (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
  );

-- Messages policies
CREATE POLICY "Messages are viewable by room members"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = room_id
      AND (
        NOT is_private OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
      )
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Games policies
CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Game participants can update games"
  ON public.games FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT jsonb_array_elements_text(players)
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();