import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext"; // Import the context
import "./Home.scss";
import Button from "../../Components/Button/Button";
import Reward from "../../Components/Reward/Reward";

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

  const addCoins = () => {
    addCurrency("coins", 10);
  };

  const handleReward = () => {
    setIsRewardOpen(true);
  };

  return (
    <div className="home">
      <Button text={"Card Bank"} onClick={navigateToCardBank} />
      <Button text={"Expeditions"} onClick={navigateToExpedition} />
      <Button text={"OpenPack"} onClick={navigateToOpenPack} />
      <Button text={"Edit Team"} onClick={navigateToEditTeam} />
      <Button text={"Help"} onClick={navigateToHelp} />
      <Button text={"Add 10 Coins"} onClick={addCoins} type="secondary" />
      <Button text={"Reward"} onClick={handleReward} type="secondary" />

      <Reward 
                modalOpen={isRewardOpen} 
                setModalOpen={setIsRewardOpen}
                presetReward={null} 
                items={2} 
                type={['token', 'talisman']} 
            />
    </div>
  );
};

export default Home;
