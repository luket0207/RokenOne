import React from "react";
import "./Izakaya.scss";
import Button from "../../Components/Button/Button";
import { useNavigate } from "react-router-dom";

const Izakaya = () => {
  const navigate = useNavigate();

  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
  };
;

  return (
    <div className="izakaya">
      <h1>Izakaya</h1>
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Izakaya;
