import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import RokenBattle from "../../../../Assets/Images/Roken_Battle_Back.png";
import "./Team.scss";
import CharacterCard from "../../../../Components/CharacterCard/CharacterCard";

const Team = ({ playerTeam, turn }) => {
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
          <div key={teammate.id} className={`battle-pod ${positionClass}`}>
            <div
              className={`battle-pod-image ${
                teammate.actionPlayed
                  ? `image-action-${teammate.actionPlayed.type}`
                  : ""
              }`}
            >
              <img src={RokenBattle} alt="Roken" />
            </div>

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
