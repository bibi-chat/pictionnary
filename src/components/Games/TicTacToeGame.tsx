import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Game } from '../../types';

interface TicTacToeGameProps {
  game: Game;
}

type Board = (string | null)[][];
type Player = 'X' | 'O';

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ game }) => {
  const { state, dispatch } = useAppContext();
  const { currentUser, users } = state;
  
  const [board, setBoard] = useState<Board>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  // Assign X to the first player, O to the second
  const playerX = game.players[0];
  const playerO = game.players[1];

  // Check if the current user is allowed to play
  const isMyTurn = currentUser && (
    (currentPlayer === 'X' && currentUser.id === playerX) ||
    (currentPlayer === 'O' && currentUser.id === playerO)
  );
  
  const canPlay = game.status === 'active' && 
                  game.players.length >= 2 && 
                  !winner && !isDraw && 
                  isMyTurn;

  const checkWinner = (board: Board): string | null => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return board[i][0] as string;
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
        return board[0][i] as string;
      }
    }
    
    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return board[0][0] as string;
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return board[0][2] as string;
    }
    
    return null;
  };

  const checkDraw = (board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  };

  const handleCellClick = (row: number, col: number) => {
    if (!canPlay || board[row][col] !== null) return;
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    const gameDraw = !gameWinner && checkDraw(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      
      // Update game with winner
      const winnerId = gameWinner === 'X' ? playerX : playerO;
      const updatedGame = {
        ...game,
        status: 'finished',
        endedAt: new Date(),
        winner: winnerId
      };
      
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      
      // Add system message
      const systemMessage = {
        id: `msg${Date.now()}`,
        roomId: game.id.replace('game', 'room'),
        userId: winnerId,
        content: `${users[winnerId]?.username || 'Unknown'} won the Tic-Tac-Toe game!`,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: systemMessage });
    } else if (gameDraw) {
      setIsDraw(true);
      
      // Update game as draw
      const updatedGame = {
        ...game,
        status: 'finished',
        endedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      
      // Add system message
      const systemMessage = {
        id: `msg${Date.now()}`,
        roomId: game.id.replace('game', 'room'),
        userId: currentUser?.id || '',
        content: `The Tic-Tac-Toe game ended in a draw!`,
        timestamp: new Date(),
        isSystemMessage: true
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: systemMessage });
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  // If game status changes to active and board is empty, set it up
  useEffect(() => {
    if (game.status === 'active' && game.players.length >= 2) {
      if (board.every(row => row.every(cell => cell === null))) {
        setBoard([
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ]);
        setCurrentPlayer('X');
        setWinner(null);
        setIsDraw(false);
      }
    }
  }, [game.status, game.players]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        {game.players.length < 2 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Waiting for another player to join...
          </p>
        ) : winner ? (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {winner === 'X' 
              ? `${users[playerX]?.username || 'Player 1'} (X) wins!`
              : `${users[playerO]?.username || 'Player 2'} (O) wins!`}
          </p>
        ) : isDraw ? (
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Game ended in a draw!
          </p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {currentPlayer === 'X' 
              ? `${users[playerX]?.username || 'Player 1'}'s turn (X)`
              : `${users[playerO]?.username || 'Player 2'}'s turn (O)`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded 
                ${cell ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'} 
                ${!canPlay || cell ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={!canPlay || cell !== null}
            >
              {cell && (
                <span className={cell === 'X' ? 'text-blue-600' : 'text-red-600'}>
                  {cell}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {(winner || isDraw) && (
        <button
          onClick={() => {
            setBoard([
              [null, null, null],
              [null, null, null],
              [null, null, null]
            ]);
            setCurrentPlayer('X');
            setWinner(null);
            setIsDraw(false);
            
            // Update game to active again
            const updatedGame = {
              ...game,
              status: 'active',
              startedAt: new Date(),
              endedAt: undefined,
              winner: undefined
            };
            
            dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToeGame;