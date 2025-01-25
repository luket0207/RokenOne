import React, { useState, useContext, useEffect } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useNavigate } from "react-router-dom";
import teammates from "../../Data/Characters/Teammates.json";
import sittingRoken from "../../Assets/Images/sittingRoken.png";
import actions from "../../Data/Actions/Actions.json";
import "./Start.scss";
import Button from "../../Components/Button/Button";

const Start = () => {
  const { setPlayerTeam, setExpeditionData } = useContext(GameDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const roken = teammates.find((character) => character.id === 1);
    setPlayerTeam([roken]);
  }, [setPlayerTeam]);

  const handleStart = () => {
    const teamWithActions = addActionsToTeam([teammates[0]]);
    setPlayerTeam(teamWithActions);
    navigate("/home");
  };

  const addActionsToTeam = (team) => {
    return team.map((character) => {
      const availableActions = actions.filter(
        (action) =>
          !action.locked &&
          (action.class === "All" || action.class === character.class)
      );
      return { ...character, actionPool: availableActions };
    });
  };

  const handleLoadGame = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const [base64ExpeditionData, base64PlayerTeam] =
          reader.result.split("\n");

        // Convert Base64 back to original data
        let expeditionData = JSON.parse(atob(base64ExpeditionData));
        const playerTeam = JSON.parse(atob(base64PlayerTeam));

        // Set the context with the loaded data
        setExpeditionData(expeditionData);
        setPlayerTeam(playerTeam);

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
