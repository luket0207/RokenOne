import React, { useState, useEffect } from "react";
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
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

  // Store previous health and defense values
  const [previousStats, setPreviousStats] = useState(
    enemies.map((enemy) => ({
      id: enemy.id,
      health: enemy.health || 0,
      defence: enemy.currentDefence || 0,
      change: null, // Stores changes for display
    }))
  );

  useEffect(() => {
    const updatedStats = enemies.map((enemy, index) => {
      const prev = previousStats[index] || {};
      const changes = [];

      // Detect health changes
      if (enemy.health !== prev.health) {
        const diff = enemy.health - prev.health;
        changes.push({
          type: "health",
          amount: Math.abs(diff),
          color: diff > 0 ? "green" : "red", // Green for heal, red for damage
        });
      }

      // Detect defense changes
      if (enemy.currentDefence !== prev.defence) {
        const diff = enemy.currentDefence - prev.defence;
        changes.push({
          type: "defence",
          amount: Math.abs(diff),
          color: diff > 0 ? "blue" : "black", // Blue for gain, black for loss
        });
      }

      return {
        id: enemy.id,
        health: enemy.health || 0,
        defence: enemy.currentDefence || 0,
        change: changes.length > 0 ? changes : null,
      };
    });

    setPreviousStats(updatedStats);

    // Clear messages after 2 seconds
    const timer = setTimeout(() => {
      setPreviousStats((prev) =>
        prev.map((stat) => ({ ...stat, change: null }))
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [enemies, turn]);

  const setTarget = (opponentIndex, health) => {
    if (health !== 0) {
      setOpponentTarget(
        opponentIndex === opponentTarget ? null : opponentIndex
      );
    }
  };

  return (
    <div className="enemy-container">
      {enemies.map((enemy, index) => {
        const formattedEnemy = {
          ...enemy,
          health: enemy.health || 0,
          currentDefence: enemy.currentDefence || 0,
          currentCharge: enemy.currentCharge || 0,
          actionPlayed: enemyActions[index],
          timeline: enemy.timeline || [],
        };

        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % (enemy.timeline.length || 1)) : -1;

        const enemyStats = previousStats.find((stat) => stat.id === enemy.id);

        return (
          <div
            key={`${index}-${turn}`}
            className={`enemy ${index === opponentTarget ? "targeted" : ""} 
              ${index === weaponAnimation ? "weapon-attacked" : ""} 
              ${index === draggedOverIndex ? "dragged-on" : ""} 
              ${enemy.health === 0 ? "dead" : ""}`}
            onClick={() => setTarget(index, enemy.health)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDraggedOverIndex(index);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDraggedOverIndex(null);
              }
            }}
            onDrop={(e) => {
              const characterIndex = e.dataTransfer.getData("characterIndex");
              setWeaponAttacker(characterIndex);
              setWeaponEnemy(index);
              setDraggedOverIndex(null);
            }}
          >
            <div className="enemy-target">
              <FontAwesomeIcon icon={faBullseye} size="2x" />
            </div>

            <div className="enemy-image">
              <FontAwesomeIcon icon={faUser} size="4x" />
            </div>

            {/* Display stat changes */}
            {enemyStats?.change && enemyStats.change.length > 0 && (
              <div className="change-display">
                {enemyStats.change
                  .filter(
                    (change) => !isNaN(change.amount) && change.amount > 0
                  ) // Ensure valid numbers
                  .map((change, i) => (
                    <div key={i} className={`change-text ${change.color}`}>
                      {change.type === "health"
                        ? change.color === "red"
                          ? `-${change.amount} HP`
                          : `+${change.amount} HP`
                        : change.color === "black"
                        ? `-${change.amount} DEF`
                        : `+${change.amount} DEF`}
                    </div>
                  ))}
              </div>
            )}

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
