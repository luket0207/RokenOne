import React, { useContext, useState } from "react";
import "./Izakaya.scss";
import Button from "../../Components/Button/Button";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const Izakaya = () => {
  const navigate = useNavigate();
  const { playerTeam, setPlayerTeam, moveToNextDay } = useContext(GameDataContext);

  const [isHealed, setIsHealed] = useState(false);

  // Function to heal the entire team by 25% of their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => {
      // Calculate 25% of maxHealth
      const healthToHeal = character.maxHealth * 0.25;

      // Add the healing but don't exceed maxHealth
      const newHealth = Math.min(character.health + healthToHeal, character.maxHealth);

      return {
        ...character,
        health: newHealth, // Update health to healed value
      };
    });
    setPlayerTeam(healedTeam);
    setIsHealed(true); // Set healed status to true
  };

  const handleContinue = () => {
    moveToNextDay();
    setIsHealed(false); // Reset healing status
    navigate("/expeditionhome"); // Navigate back
  };

  return (
    <div className="izakaya">
      <h1>Izakaya</h1>
      <p>Heal 25% of max health</p>

      <div className="character-list">
        {playerTeam.map((character, index) => {
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
                    width: `${healthPercentage}%`,
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
        text={"Heal"}
        onClick={healTeam}
        type={"secondary"}
        disabled={isHealed}
      />
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Izakaya;
