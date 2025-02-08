import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Button from "../../Components/Button/Button";
import expeditionsData from "../../Data/Expeditions/Expeditions.json";
import goonsData from "../../Data/Characters/Goons.json";
import bossesData from "../../Data/Characters/Bosses.json";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import context
import "./ExpeditionChoice.scss";

const ExpeditionChoice = () => {
  const [generatedExpedition, setGeneratedExpedition] = useState(null);
  const { setExpeditionData, playerTeam, setPlayerTeam } =
    useContext(GameDataContext); // Get context function
  const navigate = useNavigate(); // Initialize useNavigate

  const generateExpedition = (expeditionId) => {
    const expedition = expeditionsData.find((exp) => exp.id === expeditionId);

    if (!expedition) {
      return;
    }

    const {
      name,
      difficulty,
      class: expClass,
      enemies,
      minDays,
      maxDays,
      boss: bossIds, // Added bossIds from the expedition data
    } = expedition;

    const totalDays = getRandomNumber(minDays, maxDays);
    const battleDaysPercentage = getRandomNumber(75, 90) / 100;
    const battleDaysCount = Math.floor(totalDays * battleDaysPercentage);
    const battleDays = generateBattleDays(battleDaysCount, totalDays);
    const minBattleOnly = Math.floor(battleDaysCount * 0.2);
    const maxBattleOnly = Math.floor(battleDaysCount * 0.3);
    const battleOnlyDaysCount = getRandomNumber(minBattleOnly, maxBattleOnly);
    const eligibleBattleDays = battleDays.filter((day) => day >= 3);
    const battleOnlyDays = [];
    let lastBattleOnlyDay = -2;

    for (const day of eligibleBattleDays) {
      if (battleOnlyDays.length >= battleOnlyDaysCount) break;
      if (day !== lastBattleOnlyDay + 1) {
        battleOnlyDays.push(day);
        lastBattleOnlyDay = day;
      }
    }

    let days = [];
    for (let i = 0; i < totalDays; i++) {
      const shouldHaveBattle = battleDays.includes(i);
      const isBattleOnly = battleOnlyDays.includes(i);
      const dayChoices = generateDayChoices(
        shouldHaveBattle,
        isBattleOnly,
        i,
        totalDays,
        difficulty,
        enemies
      );
      days.push(dayChoices);
    }

    // Ensure no consecutive battle-only days
    let hasSwaps = true;
    let iterationCount = 0;
    const maxIterations = 1000;
    let lastValidState = [...days];

    while (hasSwaps && iterationCount < maxIterations) {
      hasSwaps = false;
      iterationCount++;
      for (let i = 0; i < days.length - 1; i++) {
        const currentDay = days[i];
        const nextDay = days[i + 1];
        if (currentDay.length === 1 && nextDay.length === 1) {
          if (i + 2 < days.length) {
            [days[i + 1], days[i + 2]] = [days[i + 2], days[i + 1]];
            hasSwaps = true;
            break;
          }
        }
      }
      if (hasSwaps) {
        lastValidState = [...days];
      }
      if (iterationCount >= maxIterations) {
        console.warn(
          "Max iterations reached while attempting to resolve consecutive battle-only days."
        );
        break;
      }
    }

    // Assign last valid state
    days = lastValidState;

    // Fetch a random boss ID from the boss array
    const bossId = bossIds[getRandomNumber(0, bossIds.length - 1)];

    // Fetch boss data from Bosses.json using bossId
    const bossData = bossesData.find((boss) => boss.id === bossId);

    // Insert the boss battle as the final day
    if (bossData) {
      const bossBattleDay = {
        name: "Boss Battle",
        type: "battle",
        enemies: [bossData.name], // Put the boss in the enemies array
      };
      days.push([bossBattleDay]); // Add the boss battle as the last day, wrapped in an array
    }

    // Final expedition data
    const expeditionData = {
      name,
      class: expClass,
      days,
      started: false,
    };

    setGeneratedExpedition(expeditionData);
    setExpeditionData((prevData) => [
      {
        ...prevData[0],
        expedition: expeditionData,
      },
    ]);

    console.log(expeditionData);
    healTeam();
    navigate("/expeditionhome");
  };

  const generateBattleDays = (battleDaysCount, totalDays) => {
    // Create an array of all possible day indices
    const allDays = Array.from({ length: totalDays }, (_, i) => i);

    // Shuffle the days randomly
    shuffleArray(allDays);

    // Select the first battleDaysCount days
    return allDays.slice(0, battleDaysCount);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  };

  // Function to heal the entire team to their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
  };

  const generateDayChoices = (
    shouldHaveBattle,
    isBattleOnly, // New parameter
    dayIndex,
    totalDays,
    difficulty,
    availableEnemies
  ) => {
    const numberOfChoices = getRandomNumber(2, 4); // Max choices per day is 4
    let choices = []; // Change const to let since we're modifying it
    const choiceTypes = new Set(); // To keep track of the types already added for the day

    if (shouldHaveBattle) {
      const { battle, battleDifficulty } = generateBattle(
        dayIndex,
        totalDays,
        difficulty,
        availableEnemies
      );
      choices.push({
        name: "Battle",
        type: "battle",
        enemies: battle,
        difficulty: battleDifficulty,
      });
      choiceTypes.add("battle"); // Add battle type
    }

    if (!isBattleOnly && choices.length < numberOfChoices) {
      while (choices.length < numberOfChoices) {
        const randomChoice = generateWeightedChoice(
          dayIndex, // Pass the dayIndex
          totalDays, // Pass the totalDays
          difficulty, // Pass the difficulty
          availableEnemies // Pass the availableEnemies
        );

        // Ensure the choice type and name aren't already added for the day
        if (!choiceTypes.has(`${randomChoice.type}-${randomChoice.name}`)) {
          choices.push(randomChoice);
          choiceTypes.add(`${randomChoice.type}-${randomChoice.name}`); // Add both type and name to the set
        }
      }
    }

    return choices;
  };

  const generateBattle = (
    dayIndex,
    totalDays,
    difficulty,
    availableEnemies
  ) => {
    let numberOfEnemies;
    let battleDifficulty;

    if (difficulty) {
      if (dayIndex < totalDays * 0.4) {
        numberOfEnemies = 1;
        battleDifficulty = difficulty - 1; // 100% chance of battleDifficulty being (difficulty - 1)
      } else if (dayIndex < totalDays * 0.8) {
        numberOfEnemies = 2;
        battleDifficulty = difficulty - 1;
      } else {
        battleDifficulty =
          getRandomNumber(0, 1) === 0 ? difficulty - 1 : difficulty; // 50% chance

        if (battleDifficulty === difficulty) {
          numberOfEnemies = 1;
        } else {
          numberOfEnemies = 3;
        }
      }
    }

    // Select random enemies based on numberOfEnemies
    const selectedEnemies = [];
    for (let i = 0; i < numberOfEnemies; i++) {
      const randomEnemyId =
        availableEnemies[getRandomNumber(0, availableEnemies.length - 1)];
      const enemy = goonsData.find((g) => g.id === randomEnemyId);
      if (enemy) {
        selectedEnemies.push(enemy.name);
      }
    }

    // Return both selectedEnemies and battleDifficulty as an object
    return { battle: selectedEnemies, battleDifficulty };
  };

  const generateWeightedChoice = (
    dayIndex,
    totalDays,
    difficulty,
    availableEnemies
  ) => {
    const random = Math.random();
    let choice = {};

    // Destructure with the correct variable names returned by generateBattle
    const { battle: choiceEnemies, battleDifficulty: choiceBattleDifficulty } =
      generateBattle(dayIndex, totalDays, difficulty, availableEnemies);

    if (random <= 0.22) {
      choice = {
        name: "?",
        type: "battle",
        enemies: choiceEnemies,
        difficulty: choiceBattleDifficulty,
      }; // unknown (battle)
    } else if (random <= 0.4) {
      choice = { name: "?", type: "izakaya" }; // unknown (izakaya)
    } else if (random <= 0.5) {
      choice = { name: "?", type: "cave" }; // unknown (cave)
    } else if (random <= 0.6) {
      choice = { name: "?", type: "steppingStones" }; // unknown (stepping stones)
    } else if (random <= 0.7) {
      choice = { name: "?", type: "code" }; // unknown (code)
    } else if (random <= 0.84) {
      choice = { name: "?", type: "loot" }; // unknown (loot)
    } else if (random <= 0.85) {
      choice = { name: "?", type: "easteregg" }; // unknown (easteregg)
    } else if (random <= 0.9) {
      choice = { name: "izakaya", type: "izakaya" }; // known izakaya
    } else if (random <= 0.95) {
      choice = { name: "code", type: "code" }; // known code
    } else if (random <= 0.975) {
      choice = { name: "cave", type: "cave" }; // known cave
    } else {
      choice = { name: "steppingStones", type: "steppingStones" }; // known stepping stones
    }

    return choice;
  };

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return (
    <div className="expedition-choice">
      <Button
        text={"Generate All Easy Expedition"}
        onClick={() => generateExpedition("A1")}
      />
      <Button
        text={"Generate Samurai Easy Expedition"}
        onClick={() => generateExpedition("S1")}
      />
      <Button
        text={"Generate Samurai Medium Expedition"}
        onClick={() => generateExpedition("S2")}
      />
    </div>
  );
};

export default ExpeditionChoice;
