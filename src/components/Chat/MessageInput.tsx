import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Smile } from 'lucide-react';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { state, dispatch } = useAppContext();
  const { currentRoom, currentUser } = state;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentRoom || !currentUser) return;
    
    const newMessage = {
      id: `msg${Date.now()}`,
      roomId: currentRoom.id,
      userId: currentUser.id,
      content: message.trim(),
      timestamp: new Date()
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    setMessage('');
  };

  if (!currentRoom || !currentUser) {
    return null;
  }

  return (
    <form 
      onSubmit={handleSendMessage}
      className="px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Smile className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 mx-3 py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full ${
            message.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;