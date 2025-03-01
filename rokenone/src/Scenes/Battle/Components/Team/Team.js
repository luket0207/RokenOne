import React, { useEffect, useState } from "react";
import RokenBattle from "../../../../Assets/Images/Roken_Battle_Back.png";
import "./Team.scss";
import CharacterCard from "../../../../Components/CharacterCard/CharacterCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriver } from "@fortawesome/free-solid-svg-icons";

const Team = ({ playerTeam, teamCharge, turn, autoWeaponStatus }) => {
  const positionClasses = [
    "char-one",
    "char-two",
    "char-three",
    "char-four",
    "char-five",
  ];

  // Store previous health and defence values
  const [previousStats, setPreviousStats] = useState(
    playerTeam.map((teammate) => ({
      id: teammate.id,
      health: teammate.health,
      defence: teammate.currentDefence,
      change: null, // { type: "health", amount: 10, color: "red" }
    }))
  );

  useEffect(() => {
    // Compute changes in health and defence
    const updatedStats = playerTeam.map((teammate, index) => {
      const prev = previousStats[index] || {};
      const changes = [];

      // Detect health changes
      if (teammate.health !== prev.health) {
        const diff = teammate.health - prev.health;
        changes.push({
          type: "health",
          amount: Math.abs(diff),
          color: diff > 0 ? "green" : "red", // Green for heal, red for damage
        });
      }

      // Detect defence changes
      if (teammate.currentDefence !== prev.defence) {
        const diff = teammate.currentDefence - prev.defence;
        changes.push({
          type: "defence",
          amount: Math.abs(diff),
          color: diff > 0 ? "blue" : "black", // Blue for gain, black for loss
        });
      }

      return {
        id: teammate.id,
        health: teammate.health,
        defence: teammate.currentDefence,
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
  }, [playerTeam, turn]);

  return (
    <div className="battle-pods">
      {playerTeam.map((teammate, index) => {
        const positionClass = positionClasses[index] || "";
        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % teammate.timeline.length) : -1;

        const teammateStats = previousStats.find(
          (stat) => stat.id === teammate.id
        );

        return (
          <div
            key={teammate.id}
            className={`battle-pod ${positionClass} 
            ${turn > teammate.battleFatigue / 2 ? "tired" : ""} 
            ${
              turn > teammate.battleFatigue / 2 + teammate.battleFatigue / 4
                ? "fatigued"
                : ""
            } 
            ${turn > teammate.battleFatigue ? "exhausted" : ""}`}
          >
            <div className="battle-pod-image">
              <img src={RokenBattle} alt="Roken" />
            </div>

            {autoWeaponStatus === "off" &&
              teammate.weapon &&
              teammate.weapon.length > 0 &&
              teammate.weapon[0].chargeCost <= teamCharge && (
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("characterIndex", index);
                  }}
                  className="drag-weapon"
                >
                  <FontAwesomeIcon icon={faScrewdriver} />
                </div>
              )}

            {/* Display stat changes */}
            {teammateStats?.change && teammateStats.change.length > 0 && (
              <div className="change-display">
                {teammateStats.change
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

            <CharacterCard
              teammate={teammate}
              currentActionIndex={currentActionIndex}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Team;
