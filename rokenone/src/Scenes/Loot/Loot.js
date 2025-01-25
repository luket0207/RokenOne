import React, {useContext} from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Loot.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const Loot = () => {
  const navigate = useNavigate(); // Initialize useNavigate
    const { moveToNextDay } = useContext(GameDataContext);
  

  const handleContinue = () => {
    moveToNextDay();
    navigate("/expeditionhome"); // Navigate to /expeditionhome when the button is clicked
  };

  return (
    <div className="loot">
      <p>Well done, you got some loot.</p>
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Loot;
