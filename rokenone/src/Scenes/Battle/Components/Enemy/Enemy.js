import React from "react";
import CharacterCard from "../../../../Components/CharacterCard/CharacterCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "./Enemy.scss";

const Enemy = ({ enemies, enemyHealths, enemyActions, turn }) => {
  return (
    <div className="enemy-container">
      {enemies.map((enemy, index) => {
        // Format the enemy object to pass it to CharacterCard
        const formattedEnemy = {
          ...enemy,
          health: enemyHealths[index], // Current health from enemyHealths
          currentDefence: enemy.currentDefence || 0, // Assuming enemies also have defense
          currentCharge: enemy.currentCharge || 0, // Assuming enemies also have charge
          actionPlayed: enemyActions[index], // Use enemyActions for their current action
          timeline: enemy.timeline || [], // Assuming enemies have a timeline as well
        };

        // Calculate currentActionIndex based on the turn
        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % (enemy.timeline.length || 1)) : -1;

        return (
          <div className="enemy" key={enemy.id}>
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
