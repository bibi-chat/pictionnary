import { Room, Message, Game, GameType } from '../types';

// Mock Rooms
export const mockRooms: Record<string, Room> = {
  'room1': {
    id: 'room1',
    name: 'General Chat',
    description: 'A place for general discussions',
    createdAt: new Date('2023-01-01'),
    createdBy: 'user1',
    members: ['user1', 'user2', 'user3', 'user4'],
    moderators: ['user1'],
    isPrivate: false,
    gameActive: null
  },
  'room2': {
    id: 'room2',
    name: 'Gaming Room',
    description: 'Let\'s play games together!',
    createdAt: new Date('2023-02-15'),
    createdBy: 'user2',
    members: ['user1', 'user2', 'user4'],
    moderators: ['user2'],
    isPrivate: false,
    gameActive: null
  },
  'room3': {
    id: 'room3',
    name: 'Private Discussion',
    description: 'Invitation only',
    createdAt: new Date('2023-03-20'),
    createdBy: 'user3',
    members: ['user1', 'user3'],
    moderators: ['user3'],
    isPrivate: true,
    gameActive: null
  }
};

// Mock Messages
export const mockMessages: Record<string, Message[]> = {
  'room1': [
    {
      id: 'msg1',
      roomId: 'room1',
      userId: 'user1',
      content: 'Hello everyone!',
      timestamp: new Date('2023-04-10T10:00:00')
    },
    {
      id: 'msg2',
      roomId: 'room1',
      userId: 'user2',
      content: 'Hey Alice, how are you?',
      timestamp: new Date('2023-04-10T10:05:00')
    },
    {
      id: 'msg3',
      roomId: 'room1',
      userId: 'user3',
      content: 'Good morning all!',
      timestamp: new Date('2023-04-10T10:10:00')
    }
  ],
  'room2': [
    {
      id: 'msg4',
      roomId: 'room2',
      userId: 'user2',
      content: 'Anyone want to play Tic-Tac-Toe?',
      timestamp: new Date('2023-04-11T14:00:00')
    },
    {
      id: 'msg5',
      roomId: 'room2',
      userId: 'user1',
      content: 'I\'m in!',
      timestamp: new Date('2023-04-11T14:05:00')
    }
  ],
  'room3': [
    {
      id: 'msg6',
      roomId: 'room3',
      userId: 'user3',
      content: 'Thanks for joining this private room.',
      timestamp: new Date('2023-04-12T09:00:00')
    },
    {
      id: 'msg7',
      roomId: 'room3',
      userId: 'user1',
      content: 'Happy to be here!',
      timestamp: new Date('2023-04-12T09:05:00')
    }
  ]
};

// Available Games
export const availableGames: Record<GameType, { name: string; description: string; minPlayers: number; maxPlayers: number }> = {
  'tic-tac-toe': {
    name: 'Tic-Tac-Toe',
    description: 'Classic 3x3 grid game',
    minPlayers: 2,
    maxPlayers: 2
  },
  'hangman': {
    name: 'Hangman',
    description: 'Guess the word before the man is hanged',
    minPlayers: 2,
    maxPlayers: 10
  },
  'trivia': {
    name: 'Trivia Quiz',
    description: 'Test your knowledge with fun trivia questions',
    minPlayers: 1,
    maxPlayers: 20
  },
  'rock-paper-scissors': {
    name: 'Rock Paper Scissors',
    description: 'Quick game of chance and strategy',
    minPlayers: 2,
    maxPlayers: 2
  }
};

// Active Games
export const mockGames: Record<string, Game> = {
  'game1': {
    id: 'game1',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3x3 grid game',
    minPlayers: 2,
    maxPlayers: 2,
    players: ['user1', 'user2'],
    status: 'active',
    startedAt: new Date('2023-04-11T14:10:00')
  }
};