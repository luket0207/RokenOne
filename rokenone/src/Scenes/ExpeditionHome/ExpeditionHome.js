import React, { useContext, useState } from "react";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { Link, useNavigate } from "react-router-dom";
import "./ExpeditionHome.scss";
import Button from "../../Components/Button/Button";

const ExpeditionHome = () => {
  const { playerTeam, setPlayerTeam, expeditionData, updateCurrentDay, setExpeditionData } =
    useContext(GameDataContext);
  const navigate = useNavigate();
  const [selectedEnemies, setSelectedEnemies] = useState([]); // Store selected enemies

  const continueExpedition = () => {
    console.log(expeditionData);

    if (!expeditionData[0].started) {
      setExpeditionData((prevData) => [
        {
          ...prevData[0],
          started: true, // Set 'started' to true
        },
      ]);
    } else {
      // Update the day before navigating to the Expedition Map
      const currentDay = expeditionData[0]?.day || 0; // Get the current day
      if (currentDay < expeditionData[0]?.expedition?.days.length) {
        const newDay = currentDay + 1; // Move to the next day
        updateCurrentDay(newDay); // Update the day in GameDataContext
      }
    }
    navigate("/expeditionmap"); // Navigate to the Expedition Map
  };

  const backToHome = () => {
    navigate("/home");
  };

  const navigateToEdit = (id) => {
    const navString = `/edit/${id}`;
    navigate(navString);
  };

  // Check if any teammate has no actions in their timeline (consider empty or full of null values as "no timeline")
  const hasNoTimeline = (timeline) => timeline.every((slot) => slot === null);

  // Function to heal the entire team to their maxHealth
  const healTeam = () => {
    const healedTeam = playerTeam.map((character) => ({
      ...character,
      health: character.maxHealth, // Heal to maxHealth
    }));
    setPlayerTeam(healedTeam); // Update the playerTeam in the context
  };

  // Check if the Battle button should be disabled
  const isBattleButtonDisabled = playerTeam.some((character) =>
    hasNoTimeline(character.timeline)
  );

  return (
    <div className="expedition-home">
      <h1>Your Team</h1>
      <div className="team">
        {playerTeam.map((character) => {
          const noTimeline = hasNoTimeline(character.timeline);
          return (
            <div key={character.id} className="team-teammate">
              {noTimeline && (
                <h3 className="no-timeline-flag">!</h3> // Show the ! circle if no timeline
              )}
              <h3>{character.name}</h3>
              <p className="team-teammate-detail">Health: {character.health}</p>
              <Button
                text={"Edit Timeline"}
                onClick={() => navigateToEdit(character.id)} // Wrap in arrow function
                type={"secondary"}
              ></Button>
            </div>
          );
        })}
      </div>

      <Button
        text={"Continue"}
        onClick={continueExpedition}
        disabled={isBattleButtonDisabled} // Disable if any teammate has no actions
      ></Button>

      <Button
        text={"Back to Home"}
        onClick={backToHome}
        type="secondary"
      ></Button>
    </div>
  );
};

export default ExpeditionHome;
