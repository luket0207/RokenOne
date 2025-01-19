import React from "react";
import CharacterCard from "../../../../Components/CharacterCard/CharacterCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faUser } from "@fortawesome/free-solid-svg-icons";
import "./Enemy.scss";

const Enemy = ({
  enemies,
  enemyActions,
  turn,
  opponentTarget,
  setOpponentTarget,
}) => {
  const setTarget = (opponentIndex, health) => {
    if (health !== 0) {
      setOpponentTarget(opponentIndex === opponentTarget ? null : opponentIndex);
    }
  };

  return (
    <div className="enemy-container">
      {enemies.map((enemy, index) => {
        // Format the enemy object to pass it to CharacterCard
        const formattedEnemy = {
          ...enemy,
          health: enemy.health || 0, // Current health from enemyHealths
          currentDefence: enemy.currentDefence || 0, // Assuming enemies also have defense
          currentCharge: enemy.currentCharge || 0, // Assuming enemies also have charge
          actionPlayed: enemyActions[index], // Use enemyActions for their current action
          timeline: enemy.timeline || [], // Assuming enemies have a timeline as well
        };

        // Calculate currentActionIndex based on the turn
        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % (enemy.timeline.length || 1)) : -1;

        return (
          <div
            className={`enemy ${index === opponentTarget ? "targeted" : ""} ${enemy.health === 0 ? "dead" : ""}`}
            key={enemy.id}
            onClick={() => setTarget(index, enemy.health)}
          >
            <div className="enemy-target">
              <FontAwesomeIcon icon={faBullseye} size="2x" />
            </div>
            <div className="enemy-image">
              <FontAwesomeIcon icon={faUser} size="4x" />
            </div>
            {/* Use CharacterCard component */}
            <CharacterCard
              teammate={formattedEnemy} // Pass the formatted enemy object
              currentActionIndex={currentActionIndex}
              enemy={true}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Enemy;
