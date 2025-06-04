/*
  # Create rooms table and relationships
  
  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)
      - `members` (jsonb array of user IDs)
      - `moderators` (jsonb array of user IDs)
      - `is_private` (boolean)
      - `game_active_id` (uuid, references games)
  
  2. Security
    - Enable RLS on rooms table
    - Add policies for:
      - Select: Everyone can view public rooms
      - Insert: Authenticated users can create rooms
      - Update: Room members can update room details
*/

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  moderators jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_private boolean DEFAULT false,
  game_active_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public rooms are viewable by everyone"
  ON public.rooms
  FOR SELECT
  USING (
    NOT is_private OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
  );

CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room members can update rooms"
  ON public.rooms
  FOR UPDATE
  USING (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(members))
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();