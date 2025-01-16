import React, { useContext, useState, useEffect } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { Link, useNavigate } from "react-router-dom";
import goonsData from "../../Data/Characters/Goons.json"; // Import the Goons data
import "./Home.scss";
import Button from "../../Components/Button/Button";

const Home = () => {
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const navigate = useNavigate();
  const [selectedEnemies, setSelectedEnemies] = useState([]); // Store selected enemies

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

  const navigateToTimeline = (id) => {
    const navString = `/timeline/${id}`;
    navigate(navString);
  };

  // Check if any teammate has no actions in their timeline
  const isBattleButtonDisabled = playerTeam.some(
    (character) => character.timeline.length === 0
  );

  // Function to heal the entire team to their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
  };

  return (
    <div className="home">
      <h1>Your Team</h1>
      <div className="team">
        {playerTeam.map((character) => {
          const hasNoTimeline = character.timeline.length === 0;
          return (
            <div key={character.id} className="team-teammate">
              {hasNoTimeline && (
                <h3 className="no-timeline-flag">!</h3> // Show the ! circle if no timeline
              )}
              <h2>{character.name}</h2>
              <p className="team-teammate-detail">Health: {character.health}</p>
              <Button
                text={"Edit Timeline"}
                onClick={() => navigateToTimeline(character.id)} // Wrap in arrow function
                type={"secondary"}
              ></Button>
            </div>
          );
        })}
      </div>

      {/* Button to heal the entire team */}
      <Button
        text={"Heal All"}
        onClick={healTeam}
        type={"secondary"}
      ></Button>

      <h2 className="enemy-title">Select Enemies to Battle</h2>
      <div className="enemy-selection">
        {goonsData.map((enemy) => (
          <Button
            key={enemy.id}
            text={enemy.name}
            onClick={() => addEnemyToList(enemy)}
            disabled={selectedEnemies.length >= 5}
            type="small"
          ></Button>
        ))}
      </div>

      <h3>Selected Enemies: {selectedEnemies.length}/5</h3>
      <div className="selected-enemies">
        {selectedEnemies.map((enemy, index) => (
          <div className="selected-enemies-enemy" key={index}>
            <h4>{enemy.name}</h4>
            <Button
              text={"Remove"}
              onClick={() => removeEnemyFromList(index)}
              type={"small"}
            ></Button>
          </div>
        ))}
      </div>

      <Button
        text={"Start Battle"}
        onClick={startBattle}
        disabled={selectedEnemies.length === 0 || isBattleButtonDisabled} // Disable if any teammate has no actions
      ></Button>
    </div>
  );
};

export default Home;
