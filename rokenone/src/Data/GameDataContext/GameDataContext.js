import React, { createContext, useState, useEffect } from "react";

// Create the GameDataContext
export const GameDataContext = createContext();

// Create the GameDataProvider
export const GameDataProvider = ({ children }) => {
  // Initial dummy data for game states
  const [expeditionData, setExpeditionData] = useState([
    {
      day: 0,
      expedition: null,
      started: false,
    },
  ]);

  // Initial dummy data for the player's team
  const [playerTeam, setPlayerTeam] = useState([]);

  const [playerData, setPlayerData] = useState([
    {
      xp: 0,
      currency: 0,
      maxTeammates: 2,
      cardBank: [], 
      unlockedTeammates: [
        {
          "id": 2,
          "name": "Tadashi",
          "class": "Samurai",
          "health": 100,
          "maxHealth": 100,
          "timeline": [],
          "timelineSlots": 3,
          "actionPool": [],
          "currentDefence": 0,
          "currentIllusion": 0,
          "battleFatigue": 300,
          "weapon": []
        },
        {
          "id": 3,
          "name": "Kiyoshi",
          "class": "O-Yoroi",
          "health": 100,
          "maxHealth": 100,
          "timeline": [],
          "timelineSlots": 3,
          "actionPool": [],
          "currentDefence": 0,
          "currentIllusion": 0,
          "battleFatigue": 300,
          "weapon": []
        }
      ]
    }
  ])

  // Function to update the current day of the expedition
  const updateCurrentDay = (newDay) => {
    setExpeditionData((prevData) => [
      {
        ...prevData[0],
        day: newDay,
      },
    ]);
  };

  const resetExpedition = () => {
    setExpeditionData([{ day: 0, expedition: null, started: false }]); // Reset the expedition and day
  };

  const moveToNextDay = () => {
    setExpeditionData((prevData) => [
      {
        ...prevData[0],
        day: prevData[0].day + 1, // Increment day by 1
      },
    ]);
  };

  // Add functions to modify game state or player team if needed later

  return (
    <GameDataContext.Provider
      value={{
        expeditionData,
        playerTeam,
        playerData,
        setExpeditionData,
        resetExpedition,
        setPlayerTeam,
        setPlayerData,
        updateCurrentDay,
        moveToNextDay,
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
};
