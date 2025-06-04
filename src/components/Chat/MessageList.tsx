import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Message, User } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface MessageItemProps {
  message: Message;
  sender: User | undefined;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, sender, isCurrentUser }) => {
  if (message.isSystemMessage) {
    return (
      <div className="py-2 px-4 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {sender?.avatar ? (
          <img 
            src={sender.avatar} 
            alt={sender.username} 
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mx-2"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mx-2" />
        )}
        <div 
          className={`rounded-lg px-4 py-2 ${
            isCurrentUser 
              ? 'bg-blue-600 text-white mr-2'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white ml-2'
          }`}
        >
          <div className="flex items-center mb-1">
            <span className="font-medium text-sm">
              {sender?.username || 'Unknown User'}
            </span>
            <span className="text-xs ml-2 opacity-75">
              {formatDistanceToNow(message.timestamp)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const MessageList: React.FC = () => {
  const { state } = useAppContext();
  const { currentRoom, messages, users, currentUser } = state;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const roomMessages = currentRoom ? messages[currentRoom.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
        <p>Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {roomMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Be the first to say hello!</p>
        </div>
      ) : (
        roomMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            sender={users[message.userId]}
            isCurrentUser={message.userId === currentUser?.id}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;