// ExpeditionMap.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import goonsData from "../../Data/Characters/Goons.json";
import Button from "../../Components/Button/Button";
import "./ExpeditionMap.scss";

const ExpeditionMap = () => {
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const navigate = useNavigate();

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

  // Function to handle starting the battle with selected enemies
  const startBattle = () => {
    navigate("/battle", { state: { enemies: selectedEnemies } });
  };

  return (
    <div className="expedition-map">
      <h1>Expedition Map</h1>

      {/* Debugging menu for selecting enemies */}
      <EnemySelection
        selectedEnemies={selectedEnemies}
        addEnemyToList={addEnemyToList}
        removeEnemyFromList={removeEnemyFromList}
      />
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

  const startCodeBreaker = () => {
    navigate("/codebreaker");
  };

  const navigateBack = () => {
    navigate("/expeditionhome");
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

      <Button text={"Code Breaker"} onClick={startCodeBreaker}></Button>

      <Button text={"Back to Home"} onClick={navigateBack} type="secondary"></Button>
    </div>
  );
};

export default ExpeditionMap;
