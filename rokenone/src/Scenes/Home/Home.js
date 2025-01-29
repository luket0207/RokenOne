import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import the context
import "./Home.scss";
import Button from "../../Components/Button/Button";
import ManaIcon from "../../Components/ManaIcon/ManaIcon";

const Home = () => {
  const navigate = useNavigate();
  const { expeditionData } = useContext(GameDataContext); // Access expedition data from context

  // Functions for handling button clicks
  const navigateToCardBank = () => {
    navigate("/cardbank");
  };

  const navigateToExpedition = () => {
    // Check if there is an active expedition
    if (expeditionData[0]?.expedition) {
      navigate("/expeditionhome");
    } else {
      navigate("/expeditionchoice");
    }
  };

  const navigateToOpenPack = () => {
    navigate("/openpack");
  };

  const navigateToEditTeam = () => {
    navigate("/editteam");
  };

  const navigateToHelp = () => {
    navigate("/help");
  };

  return (
    <div className="home">
      <Button text={"Card Bank"} onClick={navigateToCardBank} />
      <Button text={"Expeditions"} onClick={navigateToExpedition} />
      <Button text={"OpenPack"} onClick={navigateToOpenPack} />
      <Button text={"Edit Team"} onClick={navigateToEditTeam} />
      <Button text={"Help"} onClick={navigateToHelp} />
    </div>
  );
};

export default Home;
