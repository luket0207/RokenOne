import React from "react";
import RokenBattle from "../../../../Assets/Images/Roken_Battle_Back.png";
import "./Team.scss";
import CharacterCard from "../../../../Components/CharacterCard/CharacterCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagic } from "@fortawesome/free-solid-svg-icons";

const Team = ({ playerTeam, teamCharge, turn }) => {
  const positionClasses = [
    "char-one",
    "char-two",
    "char-three",
    "char-four",
    "char-five",
  ];

  return (
    <div className="battle-pods">
      {playerTeam.map((teammate, index) => {
        const positionClass = positionClasses[index] || "";
        const currentActionIndex =
          turn > 0 ? Math.floor((turn - 1) % teammate.timeline.length) : -1;

        return (
          <div
            key={teammate.id}
            className={`battle-pod ${positionClass} 
            ${turn > teammate.battleFatigue / 2 ? "tired" : ""} 
            ${turn > (teammate.battleFatigue / 2 + teammate.battleFatigue / 4)? "fatigued" : ""} 
            ${turn > teammate.battleFatigue ? "exhausted" : ""}`}
          >
            <div
              className={`battle-pod-image ${
                teammate.actionPlayed
                  ? `image-action-${teammate.actionPlayed.type}`
                  : ""
              }`}
            >
              <img src={RokenBattle} alt="Roken" />
            </div>

            {/* Draggable Button: Check if teammate has weapon and chargeCost <= teamCharge */}
            {teammate.weapon && teammate.weapon[0].chargeCost <= teamCharge && (
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("characterIndex", index);
                }}
                className="drag-weapon"
              >
                <FontAwesomeIcon icon={faWandMagic} />
              </div>
            )}

            {/* Use CharacterCard Component */}
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
