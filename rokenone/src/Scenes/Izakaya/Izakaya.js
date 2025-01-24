import React, { useContext } from "react";
import "./Izakaya.scss";
import Button from "../../Components/Button/Button";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const Izakaya = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);

  // Function to heal the entire team to their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
  };

  const handleContinue = () => {
    navigate("/expeditionhome"); // Navigate to /expeditionhome when the button is clicked
  };

  return (
    <div className="izakaya">
      <h1>Izakaya</h1>
      <p>Heal everyone</p>
      <Button text={"Heal All"} onClick={healTeam} type={"secondary"}></Button>
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Izakaya;
