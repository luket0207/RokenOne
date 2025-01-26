import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CardBank.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import ActionCard from "../../Components/ActionCard/ActionCard";

const CardBank = () => {
  const navigate = useNavigate();
  const { playerData } = useContext(GameDataContext);

  // Handle navigation to home
  const handleHome = () => {
    navigate("/home");
  };

  return (
    <div className="card-bank">
      <h1>Card Bank</h1>
      <div className="card-bank-list">
        {/* Ensure playerData.cardBank is an array before attempting to map */}
        {playerData?.cardBank?.length > 0 ? (
          playerData.cardBank.map((action, index) => (
            <ActionCard key={index} action={action} noAnimation={true} />
          ))
        ) : (
          <p>No actions in card bank</p> // Fallback message when cardBank is empty
        )}
      </div>
      <Button text={"Home"} onClick={handleHome} />
    </div>
  );
};

export default CardBank;
