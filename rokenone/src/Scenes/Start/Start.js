import React, { useState, useContext, useEffect } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useNavigate } from "react-router-dom";
import teammates from "../../Data/Characters/Teammates.json";
import sittingRoken from "../../Assets/Images/sittingRoken.png"; // Corrected import
import actions from "../../Data/Actions/Actions.json";
import "./Start.scss";
import Button from "../../Components/Button/Button";

const Start = () => {
  const { setPlayerTeam } = useContext(GameDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const roken = teammates.find((character) => character.id === 1);
    setPlayerTeam([roken]);
  }, [setPlayerTeam]);

  const handleStart = () => {
    const teamWithActions = addActionsToTeam([teammates[0]]); // Pass the first item wrapped in an array
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

  return (
    <div className="start">
      <h1>
        ROKEN
        <img src={sittingRoken} alt="Sitting Roken" /> {/* Corrected img usage */}
      </h1>
      <div className="teammate-buttons">
        <Button text={"Start"} onClick={handleStart}></Button>
      </div>
    </div>
  );
};

export default Start;
