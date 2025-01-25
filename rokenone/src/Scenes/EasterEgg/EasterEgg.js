import React, {useContext} from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./EasterEgg.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const EasterEgg = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { moveToNextDay } = useContext(GameDataContext);

  const handleContinue = () => {
    moveToNextDay();
    navigate("/expeditionhome"); // Navigate to /expeditionhome when the button is clicked
  };

  return (
    <div className="easter-egg">
      <p>This would be a cutscene followed by some reward</p>
      <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default EasterEgg;
