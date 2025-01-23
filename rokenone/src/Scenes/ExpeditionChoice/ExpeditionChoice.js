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
    const battleDaysCount = Math.floor(totalDays * 0.8); // 80% of days need to have battles

    // Generate battle days in a random but spread-out manner
    const battleDays = generateBattleDays(battleDaysCount, totalDays);
    const days = [];

    for (let i = 0; i < totalDays; i++) {
      const shouldHaveBattle = battleDays.includes(i); // Check if this day should have a battle
      const dayChoices = generateDayChoices(
        shouldHaveBattle,
        i,
        totalDays,
        difficulty,
        enemies
      );
      days.push(dayChoices);
    }

    const expeditionData = {
      name,
      class: expClass,
      days,
    };

    setGeneratedExpedition(expeditionData);
    setExpeditionData((prevData) => [
      {
        ...prevData[0],
        expedition: expeditionData,
        expeditionId: expeditionId,
      },
    ]); // Set the expedition in the context

    navigate("/expeditionhome"); // Navigate to /expeditionhome
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
    dayIndex,
    totalDays,
    difficulty,
    availableEnemies
  ) => {
    const numberOfChoices = getRandomNumber(2, 5);
    const choices = [];

    if (shouldHaveBattle) {
      const battle = generateBattle(
        dayIndex,
        totalDays,
        difficulty,
        availableEnemies
      );
      choices.push({ type: "battle", enemies: battle });
    }

    // Generate remaining choices based on weighted selection
    while (choices.length < numberOfChoices) {
      const randomChoice = generateWeightedChoice();
      if (!choices.includes(randomChoice)) {
        choices.push(randomChoice);
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

  const generateWeightedChoice = () => {
    const random = Math.random();
    if (random <= 0.25) {
      return { type: "unknown(battle)" };
    } else if (random <= 0.45) {
      return { type: "unknown(izakaya)" };
    } else if (random <= 0.65) {
      return { type: "unknown(minigame)" };
    } else if (random <= 0.79) {
      return { type: "unknown(loot)" };
    } else if (random <= 0.8) {
      return { type: "unknown(easteregg)" };
    } else if (random <= 0.9) {
      return { type: "izakaya" };
    } else {
      return { type: "minigame" };
    }
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
