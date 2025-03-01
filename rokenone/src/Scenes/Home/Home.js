import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import the context
import "./Home.scss";
import Button from "../../Components/Button/Button";
import Reward from "../../Components/Reward/Reward";
import ExpeditionChoice from "../ExpeditionChoice/ExpeditionChoice";

const Home = () => {
  const navigate = useNavigate();
  const { expeditionData, addCurrency } = useContext(GameDataContext); // Access expedition data from context
  const [isRewardOpen, setIsRewardOpen] = useState(false);

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

  const goTest = () => {
    navigate("/steppingstones");
  };

  return (
    <div className="home">
      <ExpeditionChoice navigateToExpedition={navigateToExpedition} />
      <div className="home-buttons">
        <Button text={"Card Bank"} onClick={navigateToCardBank} />
        <Button text={"OpenPack"} onClick={navigateToOpenPack} />
        <Button
          text={"Edit Team"}
          onClick={navigateToEditTeam}
          disabled={expeditionData[0].expedition !== null}
        />
      </div>

      <Button
        text={"How to Play (It's only short, promise)"}
        onClick={navigateToHelp}
      />
      {/* <Button text={"Test"} onClick={goTest} type="secondary" /> */}
    </div>
  );
};

export default Home;
