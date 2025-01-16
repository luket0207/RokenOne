import React, { createContext, useState, useEffect } from 'react';
import actions from '../../Data/Actions/Actions.json'; // Import the Actions.json file

// Create the GameDataContext
export const GameDataContext = createContext();

// Create the GameDataProvider
export const GameDataProvider = ({ children }) => {
  // Initial dummy data for game states
  const [gameStates, setGameStates] = useState([
    { 
      level: 1, 
      currency: 0,
     }
  ]);

  // Initial dummy data for the player's team
  const [playerTeam, setPlayerTeam] = useState([
    {
      id: 1,
      name: 'Roken',
      maxHealth: 100,
      health: 100,
      timeline: [],
      actionPool: actions.filter(action => action.player === 'All' && !action.locked), // Add actions to the pool
      currentDefence: 0,
      currentIllusion: 0
    },
  ]);

  // Check if the player is forced to select a teammate (if only Roken exists)
  useEffect(() => {
    if (playerTeam.length === 1 && playerTeam[0].name === 'Roken') {
      // Handle logic when Roken is the only character (for example, redirect to Start page)
      // In GameDataListener.js, we will handle this redirect via `useNavigate`
    }
  }, [playerTeam]);

  // Add functions to modify game state or player team if needed later
  return (
    <GameDataContext.Provider value={{ gameStates, playerTeam, setGameStates, setPlayerTeam }}>
      {children}
    </GameDataContext.Provider>
  );
};
