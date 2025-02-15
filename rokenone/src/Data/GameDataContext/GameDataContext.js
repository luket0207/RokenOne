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

  const [talismans, setTalismans]= useState([
    {
      talismansBank:[],
      maxTalismansBank: 10,
    }
  ]);

  const [playerData, setPlayerData] = useState([
    {
      level: 0,
      maxTeammates: 2,
      cardBank: [],
      autoWeaponStatus: "off",
      coins: 100,
      dustRoken: 0,
      dustSamurai: 0,
      dustOyoroi: 0,
      dustKobo: 0,
      dustTaiko: 0,
      dustGenso: 0,
      packTokens: [],
      unlockedTeammates: [
        {
          id: 2,
          name: "Tadashi",
          class: "Samurai",
          health: 100,
          maxHealth: 100,
          timeline: [],
          timelineSlots: 3,
          actionPool: [],
          currentDefence: 0,
          currentIllusion: 0,
          battleFatigue: 300,
          weapon: null,
        },
        {
          id: 3,
          name: "Kiyoshi",
          class: "Oyoroi",
          health: 100,
          maxHealth: 100,
          timeline: [],
          timelineSlots: 3,
          actionPool: [],
          currentDefence: 0,
          currentIllusion: 0,
          battleFatigue: 300,
          weapon: null,
        },
      ],
    },
  ]);

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

  // Function to spend a specific currency
  const spendCurrency = (currency, cost) => {
    setPlayerData((prevData) => {
      const currentCurrency = prevData[0][currency];
      if (currentCurrency >= cost) {
        console.log(`${cost} ${currency} spent.`);
        return [
          {
            ...prevData[0],
            [currency]: currentCurrency - cost,
          },
        ];
      } else {
        console.log(`Not enough ${currency} to spend.`);
        return prevData; // No change if not enough currency
      }
    });
  };

  // Function to add a specific currency
  const addCurrency = (currency, amount) => {
    setPlayerData((prevData) => {
      const currentCurrency = prevData[0][currency];
      return [
        {
          ...prevData[0],
          [currency]: currentCurrency + amount,
        },
      ];
    });
  };

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
        talismans,
        setTalismans,
        updateCurrentDay,
        moveToNextDay,
        spendCurrency, 
        addCurrency,   
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
};
