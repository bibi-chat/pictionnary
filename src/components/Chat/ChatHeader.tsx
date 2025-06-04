import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Settings, Info } from 'lucide-react';

const ChatHeader: React.FC = () => {
  const { state } = useAppContext();
  const { currentRoom, users } = state;
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  if (!currentRoom) return null;

  const memberCount = currentRoom.members.length;
  const createdBy = users[currentRoom.createdBy]?.username || 'Unknown';

  return (
    <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentRoom.name}
          </h2>
          {currentRoom.isPrivate && (
            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full">
              Private
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowRoomInfo(!showRoomInfo)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Info className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Users className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showRoomInfo && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          <p>{currentRoom.description || 'No description'}</p>
          <div className="mt-1 flex justify-between">
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            <span>Created by {createdBy}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;