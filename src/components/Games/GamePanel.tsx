import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { availableGames } from '../../data/mockData';
import { GameType, Game } from '../../types';
import { X } from 'lucide-react';
import TicTacToeGame from './TicTacToeGame';
import { supabase } from '../../lib/supabase';

const GamePanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentRoom, currentUser, users, games } = state;
  const [showGameList, setShowGameList] = useState(false);

  if (!currentRoom || !currentUser) return null;

  const activeGame = currentRoom.gameActiveId 
    ? games[currentRoom.gameActiveId]
    : null;

  const startGame = async (gameType: GameType) => {
    if (!currentRoom || !currentUser) return;

    const gameInfo = availableGames[gameType];
    
    // Create new game in Supabase
    const { data: newGame, error: gameError } = await supabase
      .from('games')
      .insert({
        name: gameInfo.name,
        description: gameInfo.description,
        min_players: gameInfo.minPlayers,
        max_players: gameInfo.maxPlayers,
        players: [currentUser.id],
        status: 'waiting',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (gameError || !newGame) {
      console.error('Error creating game:', gameError);
      return;
    }

    // Update room with new game
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ game_active_id: newGame.id })
      .eq('id', currentRoom.id);

    if (roomError) {
      console.error('Error updating room:', roomError);
      return;
    }

    // Add system message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        room_id: currentRoom.id,
        user_id: currentUser.id,
        content: `${currentUser.username} started a game of ${gameInfo.name}`,
        is_system_message: true
      });

    if (messageError) {
      console.error('Error creating system message:', messageError);
    }

    setShowGameList(false);
  };

  const joinGame = async () => {
    if (!activeGame || !currentUser || !currentRoom) return;
    if (activeGame.players.includes(currentUser.id)) return;
    
    const updatedPlayers = [...activeGame.players, currentUser.id];
    const newStatus = updatedPlayers.length >= activeGame.minPlayers ? 'active' : 'waiting';
    
    const { error: gameError } = await supabase
      .from('games')
      .update({
        players: updatedPlayers,
        status: newStatus
      })
      .eq('id', activeGame.id);

    if (gameError) {
      console.error('Error updating game:', gameError);
      return;
    }

    // Add system message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        room_id: currentRoom.id,
        user_id: currentUser.id,
        content: `${currentUser.username} joined the game`,
        is_system_message: true
      });

    if (messageError) {
      console.error('Error creating system message:', messageError);
    }
  };

  const endGame = async () => {
    if (!currentRoom || !activeGame) return;
    
    // Update game status
    const { error: gameError } = await supabase
      .from('games')
      .update({
        status: 'finished',
        ended_at: new Date().toISOString()
      })
      .eq('id', activeGame.id);

    if (gameError) {
      console.error('Error updating game:', gameError);
      return;
    }

    // Update room
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ game_active_id: null })
      .eq('id', currentRoom.id);

    if (roomError) {
      console.error('Error updating room:', roomError);
      return;
    }

    // Add system message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        room_id: currentRoom.id,
        user_id: currentUser.id,
        content: 'The game has ended',
        is_system_message: true
      });

    if (messageError) {
      console.error('Error creating system message:', messageError);
    }
  };

  const renderGameContent = () => {
    if (!activeGame) return null;
    
    switch (activeGame.name) {
      case 'Tic-Tac-Toe':
        return <TicTacToeGame game={activeGame} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Game type not implemented yet</p>
          </div>
        );
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
      <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-900 dark:text-white">Games</h3>
        {activeGame && (
          <button 
            onClick={endGame}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {activeGame ? (
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">{activeGame.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{activeGame.description}</p>
            
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Players:</h5>
              <div className="flex flex-wrap gap-2">
                {activeGame.players.map(playerId => {
                  const player = users[playerId];
                  return (
                    <div 
                      key={playerId}
                      className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {player?.avatar && (
                        <img 
                          src={player.avatar} 
                          alt={player.username}
                          className="w-5 h-5 rounded-full mr-1"
                        />
                      )}
                      <span>{player?.username || 'Unknown'}</span>
                    </div>
                  );
                })}
                
                {activeGame.players.length < activeGame.maxPlayers && 
                 !activeGame.players.includes(currentUser.id) && (
                  <button
                    onClick={joinGame}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-sm"
                  >
                    Join Game
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {renderGameContent()}
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4">
          {showGameList ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Available Games</h4>
              {Object.entries(availableGames).map(([type, game]) => (
                <button
                  key={type}
                  onClick={() => startGame(type as GameType)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <h5 className="font-medium text-gray-900 dark:text-white">{game.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{game.description}</p>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {game.minPlayers === game.maxPlayers
                      ? `${game.minPlayers} players`
                      : `${game.minPlayers}-${game.maxPlayers} players`}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No active game in this room</p>
              <button
                onClick={() => setShowGameList(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start a Game
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePanel;