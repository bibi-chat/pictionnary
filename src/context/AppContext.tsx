import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Room, Message, Game } from '../types';
import { supabase, subscribeToMessages, subscribeToGames } from '../lib/supabase';

// Define action types
type ActionType =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_CURRENT_ROOM'; payload: Room }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: { roomId: string; messages: Message[] } }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'JOIN_ROOM'; payload: { roomId: string; userId: string } }
  | { type: 'LEAVE_ROOM'; payload: { roomId: string; userId: string } }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'SET_USER_ONLINE_STATUS'; payload: { userId: string; isOnline: boolean } }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  currentUser: null,
  currentRoom: null,
  users: {},
  rooms: {},
  messages: {},
  games: {}
};

// Reducer function
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'ADD_MESSAGE':
      const roomId = action.payload.roomId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), action.payload]
        }
      };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: action.payload.messages
        }
      };
    
    case 'ADD_ROOM':
      return {
        ...state,
        rooms: { ...state.rooms, [action.payload.id]: action.payload }
      };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: { ...state.rooms, [action.payload.id]: action.payload },
        currentRoom: state.currentRoom?.id === action.payload.id 
          ? action.payload 
          : state.currentRoom
      };
    
    case 'JOIN_ROOM': {
      const { roomId, userId } = action.payload;
      const room = state.rooms[roomId];
      if (!room) return state;
      
      const updatedRoom = {
        ...room,
        members: room.members.includes(userId) ? room.members : [...room.members, userId]
      };
      
      return {
        ...state,
        rooms: { ...state.rooms, [roomId]: updatedRoom }
      };
    }
    
    case 'LEAVE_ROOM': {
      const { roomId, userId } = action.payload;
      const room = state.rooms[roomId];
      if (!room) return state;
      
      const updatedRoom = {
        ...room,
        members: room.members.filter(id => id !== userId)
      };
      
      return {
        ...state,
        rooms: { ...state.rooms, [roomId]: updatedRoom }
      };
    }
    
    case 'ADD_GAME':
      return {
        ...state,
        games: { ...state.games, [action.payload.id]: action.payload }
      };
    
    case 'UPDATE_GAME':
      return {
        ...state,
        games: { ...state.games, [action.payload.id]: action.payload }
      };
    
    case 'SET_USER_ONLINE_STATUS': {
      const { userId, isOnline } = action.payload;
      const user = state.users[userId];
      if (!user) return state;
      
      return {
        ...state,
        users: {
          ...state.users,
          [userId]: { ...user, isOnline }
        }
      };
    }
    
    case 'LOGOUT':
      return initialState;
    
    default:
      return state;
  }
};

// Create context
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: profile });
          }

          // Fetch rooms
          const { data: rooms } = await supabase
            .from('rooms')
            .select('*');

          if (rooms) {
            rooms.forEach(room => dispatch({ type: 'ADD_ROOM', payload: room }));
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  // Subscribe to messages when current room changes
  useEffect(() => {
    if (!state.currentRoom) return;

    const fetchMessages = async () => {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', state.currentRoom.id)
        .order('created_at', { ascending: true });

      if (messages) {
        dispatch({
          type: 'SET_MESSAGES',
          payload: { roomId: state.currentRoom.id, messages }
        });
      }
    };

    fetchMessages();

    const subscription = subscribeToMessages(state.currentRoom.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        dispatch({ type: 'ADD_MESSAGE', payload: payload.new });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [state.currentRoom]);

  // Subscribe to game updates
  useEffect(() => {
    if (!state.currentRoom?.gameActive?.id) return;

    const gameId = state.currentRoom.gameActive.id;
    const subscription = subscribeToGames(gameId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_GAME', payload: payload.new });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [state.currentRoom?.gameActive?.id]);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};