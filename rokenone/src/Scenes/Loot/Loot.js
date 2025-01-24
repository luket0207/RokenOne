import React from "react";
import "./Loot.scss";
import Button from "../../Components/Button/Button";

const Loot = () => {


  return (
    <div className="loot">
        <h1>Loot</h1>
        <p>Well done, you got some loot.</p>
        <Button text={"Continue"} onClick={handleContinue} />
    </div>
  );
};

export default Loot;
