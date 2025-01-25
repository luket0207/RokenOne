import React, { useContext, useState } from "react";
import "./Izakaya.scss";
import Button from "../../Components/Button/Button";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const Izakaya = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { playerTeam, setPlayerTeam, moveToNextDay } = useContext(GameDataContext);

  // Initialize isHealed state using useState correctly
  const [isHealed, setIsHealed] = useState(false);

  // Function to heal the entire team to their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
    setIsHealed(true); // Set the isHealed state to true
  };

  const handleContinue = () => {
    moveToNextDay();
    setIsHealed(false); // Reset isHealed when continuing
    navigate("/expeditionhome"); // Navigate to /expeditionhome when the button is clicked
  };

  return (
    <div className="izakaya">
      <h1>Izakaya</h1>
      <p>Heal everyone</p>

      {/* Render each character in the playerTeam with a health bar */}
      <div className="character-list">
        {playerTeam.map((character, index) => {
          // Calculate health bar width as a percentage of maxHealth
          const healthPercentage =
            (character.health / character.maxHealth) * 100;

          return (
            <div key={index} className="character">
              <h3>{character.name}</h3>
              <div className="health-bar-container">
                <div
                  className={`health-bar ${
                    healthPercentage < 30 ? "low-health" : ""
                  }`}
                  style={{
                    width: `${healthPercentage}%`, // Still keep the width as inline style
                  }}
                ></div>
              </div>
              <p>
                {character.health} / {character.maxHealth} HP
              </p>
            </div>
          );
        })}
      </div>

      <Button
        text={"Heal All"}
        onClick={healTeam}
        type={"secondary"}
        disabled={isHealed}
      />
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Izakaya;
