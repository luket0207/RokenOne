import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Correct import for GameDataContext
import Button from "../../Components/Button/Button";
import goonsData from "../../Data/Characters/Goons.json";
import "./ExpeditionMap.scss";

const ExpeditionMap = () => {
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const [showDebugMenu, setShowDebugMenu] = useState(false); // New state to toggle debug menu visibility
  const { expeditionData, resetExpedition } = useContext(GameDataContext); // Access expedition data and reset function
  const navigate = useNavigate();

  // Access the current day directly from the GameDataContext
  const currentDay = expeditionData[0]?.day || 0; // Default to day 0 if not found
  const expedition = expeditionData[0]?.expedition;
  const days = expedition?.days || []; // Access the days from the expedition data
  const currentDayData = days[currentDay] || {}; // Get data for the current day

  const currentChoices = Object.values(currentDayData); // Get all choices for the current day as an array

  // Function to shuffle an array (Fisher-Yates Shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  };

  // Shuffle choices when component mounts or currentDay changes
  const shuffledChoices = shuffleArray(currentChoices);

  // Function to add an enemy to the selected list
  const addEnemyToList = (enemy) => {
    if (selectedEnemies.length < 5) {
      setSelectedEnemies((prevEnemies) => [...prevEnemies, enemy]);
    }
  };

  // Function to remove an enemy from the selected list
  const removeEnemyFromList = (indexToRemove) => {
    setSelectedEnemies((prevEnemies) =>
      prevEnemies.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCompleteExpedition = () => {
    resetExpedition();
    navigate("/home");
  };

  const navigateBackExpedition = () => {
    navigate("/expeditionhome");
  };

  // Toggle the debug menu visibility
  const toggleDebugMenu = () => {
    setShowDebugMenu((prevState) => !prevState);
  };

  // Function to handle advancing to the next day or completing the expedition
  const handleChoice = (type, enemies) => {
    console.log(`Type of choice is: ${type}`);

    if (enemies) {
      console.log(`Enemies for battle: ${enemies}`);
    }
  };

  // Check if expedition is complete
  const isExpeditionComplete = currentDay >= days.length;

  // Effect to handle expedition completion on load
  useEffect(() => {
    if (isExpeditionComplete && expeditionData.expedition) {
      console.log("Expedition complete");

      // Reset expedition data and day
      

      // Hide the debug menu or remove all content
      setShowDebugMenu(false);
    }
  }, [isExpeditionComplete, resetExpedition, expeditionData]);

  return (
    <div className="expedition-map">
      <h1>Expedition Map</h1>

      {/* If the expedition is complete, show the link back to home */}
      {isExpeditionComplete ? (
        <div className="expedition-complete">
          <h2>Expedition Complete!</h2>
          <Button text="Back to Home" onClick={handleCompleteExpedition} type="primary" />
        </div>
      ) : (
        <>
          {/* Display choices for the current day */}
          <h2>Day {currentDay + 1}</h2>

          <div className="choices">
            {shuffledChoices.map((choice, index) => (
              <div
                key={index}
                className="choice"
                onClick={() => handleChoice(choice.type, choice.enemies)}
              >
                <p>{choice.type ? `${choice.name}` : "Unknown Choice"}</p>{" "}
                {/* Display the choice type and enemies (if available) */}
              </div>
            ))}
          </div>

          {/* Button to toggle the visibility of the debug menu */}
          <Button
            text={showDebugMenu ? "Hide Debug Menu" : "Show Debug Menu"}
            onClick={toggleDebugMenu}
            type="secondary"
          />

          {/* Conditionally render the debugging menu based on state */}
          {showDebugMenu && (
            <EnemySelection
              selectedEnemies={selectedEnemies}
              addEnemyToList={addEnemyToList}
              removeEnemyFromList={removeEnemyFromList}
            />
          )}
        </>
      )}

      <Button
        text={"Back to Expedition Home"}
        onClick={navigateBackExpedition}
        type="secondary"
      ></Button>
    </div>
  );
};

// Nested EnemySelection component
const EnemySelection = ({
  selectedEnemies,
  addEnemyToList,
  removeEnemyFromList,
}) => {
  const navigate = useNavigate();

  // Function to handle starting the battle with selected enemies
  const startBattle = () => {
    navigate("/battle", { state: { enemies: selectedEnemies } });
  };

  return (
    <div className="enemies">
      <h2>Select Enemies to Battle</h2>
      <div className="enemy-selection">
        {goonsData.map((enemy) => (
          <Button
            key={enemy.id}
            text={enemy.name}
            onClick={() => addEnemyToList(enemy)}
            disabled={selectedEnemies.length >= 4}
            type="small"
          />
        ))}
      </div>
      <h3>Selected Enemies: {selectedEnemies.length}/4</h3>
      <div className="selected-enemies">
        {selectedEnemies.map((enemy) => (
          <div className="selected-enemies-enemy" key={enemy.id}>
            <h4>{enemy.name}</h4>
            <Button
              text={"Remove"}
              onClick={() =>
                removeEnemyFromList(selectedEnemies.indexOf(enemy))
              }
              type={"small"}
            />
          </div>
        ))}
      </div>

      <Button
        text={"Start Battle"}
        onClick={startBattle}
        disabled={selectedEnemies.length === 0}
      ></Button>
    </div>
  );
};

export default ExpeditionMap;
