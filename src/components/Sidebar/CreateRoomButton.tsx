import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Room } from '../../types';
import { supabase } from '../../lib/supabase';

const CreateRoomButton: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !state.currentUser) return;

    try {
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert({
          name: roomName.trim(),
          description: roomDescription.trim() || null,
          created_by: state.currentUser.id,
          members: [state.currentUser.id],
          moderators: [state.currentUser.id],
          is_private: isPrivate,
          game_active_id: null
        })
        .select()
        .single();

      if (error) throw error;

      if (newRoom) {
        // Add system message
        await supabase
          .from('messages')
          .insert({
            room_id: newRoom.id,
            user_id: state.currentUser.id,
            content: `${state.currentUser.username} created this room`,
            is_system_message: true
          });

        dispatch({ type: 'ADD_ROOM', payload: newRoom });
        dispatch({ type: 'SET_CURRENT_ROOM', payload: newRoom });
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }

    setRoomName('');
    setRoomDescription('');
    setIsPrivate(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Room
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Room
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter room name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter room description"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private-room"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="private-room"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Private Room
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  roomName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateRoomButton;