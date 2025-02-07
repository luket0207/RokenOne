import React, { useState, useContext, useEffect } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useNavigate } from "react-router-dom";
import teammates from "../../Data/Characters/Teammates.json";
import sittingRoken from "../../Assets/Images/sittingRoken.png";
import actionsAllData from "../../Data/Actions/All.json";
import "./Start.scss";
import Button from "../../Components/Button/Button";

const Start = () => {
  const { setPlayerTeam, setExpeditionData, setPlayerData, setTalismans } = useContext(GameDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const roken = teammates.find((character) => character.id === 1);
    setPlayerTeam([roken]);
  }, [setPlayerTeam]);

  const handleStart = () => {
    const teamWithActions = addActionsToRoken([teammates[0]]);
    setPlayerTeam(teamWithActions);
    navigate("/home");
  };

  const addActionsToRoken = (team) => {
    return team.map((character) => {
      if (character.class === "Roken") {
        const availableActions = actionsAllData.filter(
          (action) => action.id === "A001" || action.id === "A002"
        );
        return { ...character, actionPool: availableActions };
      }
      return character; // Return other characters unchanged
    });
  };  

  const handleLoadGame = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const [base64ExpeditionData, base64PlayerTeam, base64PlayerData, base64Talismans] =
          reader.result.split("\n");

        // Convert Base64 back to original data
        let expeditionData = JSON.parse(atob(base64ExpeditionData));
        const playerTeam = JSON.parse(atob(base64PlayerTeam));
        const playerData = JSON.parse(atob(base64PlayerData));
        const talismans = JSON.parse(atob(base64Talismans));

        // Set the context with the loaded data
        setExpeditionData(expeditionData);
        setPlayerTeam(playerTeam);
        setPlayerData(playerData);
        setTalismans(talismans);

        // Navigate to home to continue the game
        navigate("/home");
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="start">
      <h1>
        ROKEN
        <img src={sittingRoken} alt="Sitting Roken" />
      </h1>
      <div>
      <div className="load-game">
        <input type="file" onChange={handleLoadGame} id="file-input" />
        <label htmlFor="file-input" className="custom-file-button">
          <Button text={"Load Game"} />
        </label>
      </div>
      <div>
        <Button text={"Start New Game"} onClick={handleStart}></Button>
      </div>
      </div>
      
    </div>
  );
};

export default Start;
