/*
# Initial Schema Setup

1. New Tables
  - profiles
    - id (uuid, primary key)
    - username (text)
    - avatar_url (text)
    - is_online (boolean)
    - created_at (timestamp)
    - updated_at (timestamp)
  
  - rooms
    - id (uuid, primary key)
    - name (text)
    - description (text)
    - created_by (uuid, references profiles)
    - members (uuid array)
    - created_at (timestamp)
    - updated_at (timestamp)
  
  - messages
    - id (uuid, primary key)
    - room_id (uuid, references rooms)
    - user_id (uuid, references profiles)
    - content (text)
    - created_at (timestamp)
    - updated_at (timestamp)
  
  - games
    - id (uuid, primary key)
    - room_id (uuid, references rooms)
    - type (text)
    - state (jsonb)
    - players (uuid array)
    - winner (uuid, references profiles)
    - created_at (timestamp)
    - updated_at (timestamp)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  members uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  type text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  players uuid[] DEFAULT ARRAY[]::uuid[],
  winner uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Rooms policies
CREATE POLICY "Rooms are viewable by authenticated users"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Messages policies
CREATE POLICY "Room members can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = room_id
      AND created_by = auth.uid()
      OR auth.uid() = ANY(members)
    )
  );

CREATE POLICY "Room members can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = room_id
      AND created_by = auth.uid()
      OR auth.uid() = ANY(members)
    )
  );

-- Games policies
CREATE POLICY "Room members can view games"
  ON games FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = room_id
      AND created_by = auth.uid()
      OR auth.uid() = ANY(members)
    )
  );

CREATE POLICY "Room members can update games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = room_id
      AND created_by = auth.uid()
      OR auth.uid() = ANY(members)
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();