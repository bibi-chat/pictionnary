export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  members: string[]; // User IDs
  moderators: string[]; // User IDs
  isPrivate: boolean;
  gameActiveId?: string | null; // Changed from gameActive to gameActiveId
}

export interface Game {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  players: string[]; // User IDs
  status: 'waiting' | 'active' | 'finished';
  startedAt?: Date;
  endedAt?: Date;
  winner?: string; // User ID
}

export type GameType = 'tic-tac-toe' | 'hangman' | 'trivia' | 'rock-paper-scissors';

export interface AppState {
  currentUser: User | null;
  currentRoom: Room | null;
  users: Record<string, User>;
  rooms: Record<string, Room>;
  messages: Record<string, Message[]>; // Keyed by roomId
  games: Record<string, Game>; // Keyed by gameId
}