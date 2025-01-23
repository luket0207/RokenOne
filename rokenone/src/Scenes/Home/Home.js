import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import the context
import "./Home.scss";
import Button from "../../Components/Button/Button";

const Home = () => {
  const navigate = useNavigate();
  const { expeditionData } = useContext(GameDataContext); // Access expedition data from context

  // Functions for handling button clicks
  const navigateToShop = () => {
    navigate("/shop");
  };

  const navigateToExpedition = () => {
    // Check if there is an active expedition
    if (expeditionData[0]?.expedition) {
      navigate("/expeditionhome");
    } else {
      navigate("/expeditionchoice");
    }
  };

  const navigateToCards = () => {
    navigate("/cards");
  };

  const navigateToEditTeam = () => {
    navigate("/editteam");
  };

  const navigateToCodeBreaker = () => {
    navigate("/codebreaker");
  };

  const navigateToCave = () => {
    navigate("/cave");
  };

  return (
    <div className="home">
      <Button text={"Shop"} onClick={navigateToShop} />
      <Button text={"Expeditions"} onClick={navigateToExpedition} />
      <Button text={"Cards"} onClick={navigateToCards} />
      <Button text={"Edit Team"} onClick={navigateToEditTeam} />
      <Button text={"Code Breaker"} onClick={navigateToCodeBreaker} />
      <Button text={"Cave"} onClick={navigateToCave} />
    </div>
  );
};

export default Home;
