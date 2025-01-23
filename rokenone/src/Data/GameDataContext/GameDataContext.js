import React, { createContext, useState, useEffect } from 'react';
import actions from '../../Data/Actions/Actions.json'; // Import the Actions.json file

// Create the GameDataContext
export const GameDataContext = createContext();

// Create the GameDataProvider
export const GameDataProvider = ({ children }) => {
  // Initial dummy data for game states
  const [expeditionData, setExpeditionData] = useState([
    { 
      day: 0, 
      expedition: null, 
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

  // Function to update the current day of the expedition
  const updateCurrentDay = (newDay) => {
    setExpeditionData((prevData) => [
      {
        ...prevData[0], 
        day: newDay
      }
    ]);
  };

  const resetExpedition = () => {
    setExpeditionData([{ expedition: null, day: 0 }]); // Reset the expedition and day
  };

  // Add functions to modify game state or player team if needed later

  return (
    <GameDataContext.Provider value={{ expeditionData, playerTeam, setExpeditionData, resetExpedition, setPlayerTeam, updateCurrentDay }}>
      {children}
    </GameDataContext.Provider>
  );
};
