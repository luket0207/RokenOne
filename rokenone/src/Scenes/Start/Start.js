import React, { useState, useContext, useEffect } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useNavigate } from "react-router-dom";
import teammates from "../../Data/Characters/Teammates.json";
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

  const handleSelection = (character) => {
    const updatedTeam = [teammates.find((c) => c.id === 1), character];
    const teamWithActions = addActionsToTeam(updatedTeam);
    setPlayerTeam(teamWithActions);
    navigate("/expeditionhome");
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
      <h1>Select a character to join your team:</h1>
      <div className="teammate-buttons">
        {teammates
          .filter((character) => character.id !== 1)
          .map((character) => (
            <div key={character.id}>
              <Button
                text={character.name}
                onClick={() => handleSelection(character)}
                type={"secondary"}
              ></Button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Start;
