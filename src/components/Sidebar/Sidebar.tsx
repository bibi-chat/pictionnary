import React from 'react';
import UserProfile from './UserProfile';
import RoomList from './RoomList';
import CreateRoomButton from './CreateRoomButton';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full flex flex-col bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <UserProfile />
      <RoomList />
      <CreateRoomButton />
    </div>
  );
};

export default Sidebar;