import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.scss";
import Button from "../../Components/Button/Button";

const Home = () => {
  const navigate = useNavigate();

  // Functions for handling button clicks
  const navigateToShop = () => {
    navigate("/shop");
  };

  const navigateToExpeditionHome = () => {
    navigate("/expeditionhome");
  };

  const navigateToCards = () => {
    navigate("/cards");
  };

  const navigateToEditTeam = () => {
    navigate("/editteam");
  };

  return (
    <div className="home">
      <Button text={"Shop"} onClick={navigateToShop} />
      <Button text={"Expeditions"} onClick={navigateToExpeditionHome} />
      <Button text={"Cards"} onClick={navigateToCards} />
      <Button text={"Edit Team"} onClick={navigateToEditTeam} />
    </div>
  );
};

export default Home;
