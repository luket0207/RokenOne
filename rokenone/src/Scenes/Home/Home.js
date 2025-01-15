import React, { useContext, useState } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { Link, useNavigate } from "react-router-dom";
import goonsData from "../../Data/Characters/Goons.json"; // Import the Goons data
import "./Home.scss";
import Button from "../../Components/Button/Button";

const Home = () => {
  const { playerTeam } = useContext(GameDataContext);
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

  return (
    <div className="home">
      <h1>Your Team</h1>
      <div className="team">
        {playerTeam.map((character) => (
          <div key={character.id} className="team-teammate">
            <h2>{character.name}</h2>
            <p className="team-teammate-detail">Health: {character.health}</p>
            <Button
              text={"Edit Timeline"}
              onClick={() => navigateToTimeline(character.id)} // Wrap in arrow function
              type={"secondary"}
            ></Button>
          </div>
        ))}
      </div>

      <h2>Select Enemies to Battle</h2>
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
            <Button text={"Remove"} onClick={() => removeEnemyFromList(index)} type={"small"}></Button>
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

export default Home;
