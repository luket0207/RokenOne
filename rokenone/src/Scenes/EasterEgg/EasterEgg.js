import React, { useState } from "react";
import "./EasterEgg.scss";
import Button from "../../Components/Button/Button";
import Reward from "../../Components/Reward/Reward";

const EasterEgg = () => {
  const [isRewardOpen, setIsRewardOpen] = useState(false);

  const handleContinue = () => {
    setIsRewardOpen(true);
  };

  return (
    <div className="easter-egg">
      <p>This would be a cutscene followed by some better reward, but for now it's this. Sorry.</p>
      <p>You still get a free token though. Which is nice.</p>
      <Button text={"Give it to me"} onClick={handleContinue} />
      <Reward
          modalOpen={isRewardOpen}
          setModalOpen={setIsRewardOpen}
          presetReward={null}
          items={1}
          type={["token"]}
        />
    </div>
  );
};

export default EasterEgg;
