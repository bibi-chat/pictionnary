import React from 'react';
import { User } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { UserCircle } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { state } = useAppContext();
  const user = state.currentUser;

  if (!user) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="w-10 h-10 text-gray-400" />
        )}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{user.username}</h3>
          <div className="flex items-center text-sm">
            <span className="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            <span className="text-gray-500 dark:text-gray-400">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;