import React, { useState } from "react";
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
  setWeaponAttacker,
  setWeaponEnemy,
  weaponAnimation,
}) => {
  // State to track which enemy is being dragged over
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

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
          health: enemy.health || 0,
          currentDefence: enemy.currentDefence || 0,
          currentCharge: enemy.currentCharge || 0,
          actionPlayed: enemyActions[index],
          timeline: enemy.timeline || [],
        };

        // Calculate currentActionIndex based on the turn
        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % (enemy.timeline.length || 1)) : -1;

        return (
          <div
            className={`enemy ${index === opponentTarget ? "targeted" : ""} 
              ${index === weaponAnimation ? "weapon-attacked" : ""} 
              ${index === draggedOverIndex ? "dragged-on" : ""} 
              ${enemy.health === 0 ? "dead" : ""}`}
            key={enemy.id}
            onClick={() => setTarget(index, enemy.health)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              // Ensure the dragged item stays "dragged-on" while hovering
              setDraggedOverIndex(index);
            }}
            onDragLeave={(e) => {
              // Only remove the class if the drag has truly left the element
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDraggedOverIndex(null);
              }
            }}
            onDrop={(e) => {
              const characterIndex = e.dataTransfer.getData("characterIndex");
              // Call the passed in functions to set the weapon attacker and enemy
              setWeaponAttacker(characterIndex);
              setWeaponEnemy(index);
              setDraggedOverIndex(null); // Clear the drag state when dropped
            }}
          >
            <div className="enemy-target">
              <FontAwesomeIcon icon={faBullseye} size="2x" />
            </div>
            <div className="enemy-image">
              <FontAwesomeIcon icon={faUser} size="4x" />
            </div>
            {/* Use CharacterCard component */}
            <CharacterCard
              teammate={formattedEnemy}
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
