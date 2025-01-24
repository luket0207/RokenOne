import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Button from "../../Components/Button/Button";
import expeditionsData from "../../Data/Expeditions/Expeditions.json";
import goonsData from "../../Data/Characters/Goons.json";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import context
import "./ExpeditionChoice.scss";

const ExpeditionChoice = () => {
  const [generatedExpedition, setGeneratedExpedition] = useState(null);
  const { setExpeditionData } = useContext(GameDataContext); // Get context function
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
    } = expedition;
    const totalDays = getRandomNumber(minDays, maxDays);

    // Generate a random percentage between 0.75 and 0.9
    const battleDaysPercentage = getRandomNumber(75, 90) / 100;

    // Calculate the number of battle days using the random percentage
    const battleDaysCount = Math.floor(totalDays * battleDaysPercentage);

    // Generate battle days in a random but spread-out manner
    const battleDays = generateBattleDays(battleDaysCount, totalDays);

    // Randomly select 10-30% of battle days to have only the battle as a choice, starting from day 3
    const minBattleOnly = Math.floor(battleDaysCount * 0.2);
    const maxBattleOnly = Math.floor(battleDaysCount * 0.3);
    const battleOnlyDaysCount = getRandomNumber(minBattleOnly, maxBattleOnly);

    // Exclude the first 3 days when selecting battle-only days
    const eligibleBattleDays = battleDays.filter((day) => day >= 3);

    // Select a portion of eligible battle days to be battle-only
    const battleOnlyDays = [];
    let lastBattleOnlyDay = -2; // Start with a number to allow the first comparison

    for (const day of eligibleBattleDays) {
      if (battleOnlyDays.length >= battleOnlyDaysCount) break; // Stop once we've selected enough battle-only days

      // Ensure it's not consecutive to the last battle-only day
      if (day !== lastBattleOnlyDay + 1) {
        battleOnlyDays.push(day);
        lastBattleOnlyDay = day;
      }
    }

    // Now process the entire `days` array and ensure no consecutive battle-only days
    // Now process the entire `days` array and ensure no consecutive battle-only days
    let days = []; // Use let instead of const to allow reassignment

    for (let i = 0; i < totalDays; i++) {
      const shouldHaveBattle = battleDays.includes(i); // Check if this day should have a battle
      const isBattleOnly = battleOnlyDays.includes(i); // Check if this day is battle-only
      const dayChoices = generateDayChoices(
        shouldHaveBattle,
        isBattleOnly, // Pass whether it's a battle-only day
        i,
        totalDays,
        difficulty,
        enemies
      );
      days.push(dayChoices);
    }

    // Check and swap any consecutive battle-only days
    let hasSwaps = true;
    let iterationCount = 0; // Counter to track the number of iterations
    const maxIterations = 1000; // Maximum allowed iterations before we stop
    let lastValidState = [...days]; // Store the array's last valid state

    while (hasSwaps && iterationCount < maxIterations) {
      hasSwaps = false;
      iterationCount++; // Increment the iteration counter

      for (let i = 0; i < days.length - 1; i++) {
        const currentDay = days[i];
        const nextDay = days[i + 1];

        // If both the current day and next day are battle-only (length of 1)
        if (currentDay.length === 1 && nextDay.length === 1) {
          // If next day is not the last day, swap with the day after it
          if (i + 2 < days.length) {
            [days[i + 1], days[i + 2]] = [days[i + 2], days[i + 1]]; // Swap the days
            hasSwaps = true; // A swap occurred, so we need to check again
            break; // Exit the loop early to start checking again after the swap
          }
        }
      }

      // If a swap occurred, store the current state as last valid state
      if (hasSwaps) {
        lastValidState = [...days];
      }

      // If we've reached the maximum number of iterations, break the loop
      if (iterationCount >= maxIterations) {
        console.warn(
          "Max iterations reached while attempting to resolve consecutive battle-only days."
        );
        break;
      }
    }

    // After max iterations or successful resolution, set days to the last valid state
    days = lastValidState; // Reassign days to the last valid state

    // Final expedition data with adjusted days
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
      const battle = generateBattle(
        dayIndex,
        totalDays,
        difficulty,
        availableEnemies
      );
      choices.push({ name: "Battle", type: "battle", enemies: battle });
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

    if (difficulty === 1) {
      if (dayIndex < totalDays * 0.5) {
        numberOfEnemies = 1;
      } else if (dayIndex < totalDays * 0.9) {
        numberOfEnemies = 2;
      } else {
        numberOfEnemies = 3;
      }
    } else if (difficulty === 2) {
      if (dayIndex < totalDays * 0.3) {
        numberOfEnemies = 1;
      } else if (dayIndex < totalDays * 0.7) {
        numberOfEnemies = 2;
      } else {
        numberOfEnemies = 3;
      }
    }

    const selectedEnemies = [];
    for (let i = 0; i < numberOfEnemies; i++) {
      const randomEnemyId =
        availableEnemies[getRandomNumber(0, availableEnemies.length - 1)];
      const enemy = goonsData.find((g) => g.id === randomEnemyId);
      if (enemy) {
        selectedEnemies.push(enemy.name);
      }
    }

    return selectedEnemies;
  };

  const generateWeightedChoice = (
    dayIndex,
    totalDays,
    difficulty,
    availableEnemies
  ) => {
    const random = Math.random();
    let choice = {};
    const choiceEnemies = generateBattle(
      dayIndex,
      totalDays,
      difficulty,
      availableEnemies
    );

    if (random <= 0.25) {
      choice = {
        name: "?",
        type: "battle",
        enemies: choiceEnemies,
      }; // unknown (battle)
    } else if (random <= 0.45) {
      choice = { name: "?", type: "izakaya" }; // unknown (izakaya)
    } else if (random <= 0.55) {
      choice = { name: "?", type: "cave" }; // unknown (cave)
    } else if (random <= 0.65) {
      choice = { name: "?", type: "code" }; // unknown (code)
    } else if (random <= 0.79) {
      choice = { name: "?", type: "loot" }; // unknown (loot)
    } else if (random <= 0.8) {
      choice = { name: "?", type: "easteregg" }; // unknown (easteregg)
    } else if (random <= 0.9) {
      choice = { name: "izakaya", type: "izakaya" }; // known izakaya
    } else {
      choice = { name: "minigame", type: "minigame" }; // known minigame
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

      {generatedExpedition && (
        <div className="expedition-output">
          <h2>{generatedExpedition.name}</h2>
          <pre>{JSON.stringify(generatedExpedition, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExpeditionChoice;
