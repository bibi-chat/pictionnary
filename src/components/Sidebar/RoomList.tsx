import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Room } from '../../types';
import { MessageSquare, Lock, Users } from 'lucide-react';

const RoomList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { rooms, currentRoom } = state;

  const handleRoomSelect = (room: Room) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
        Rooms
      </h2>
      <ul className="space-y-1">
        {Object.values(rooms).map((room) => (
          <li 
            key={room.id}
            onClick={() => handleRoomSelect(room)}
            className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150 ease-in-out
              ${currentRoom?.id === room.id 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
          >
            <div className="mr-2">
              {room.isPrivate ? (
                <Lock className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </div>
            <span className="flex-1 truncate">{room.name}</span>
            {room.gameActive && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
            <div className="flex items-center text-xs text-gray-500 ml-2">
              <Users className="w-3 h-3 mr-1" />
              <span>{room.members.length}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;