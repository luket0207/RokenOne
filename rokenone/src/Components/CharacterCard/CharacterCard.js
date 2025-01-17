// CharacterCard.js
import React from "react";
import "./CharacterCard.scss";

const CharacterCard = ({ teammate, currentActionIndex, enemy = false }) => {
  return (
    <div className="battle-pod-details">
      <h3>{teammate.name}</h3>
      <p>Health: {teammate.health}</p>
      <p>Defence: {teammate.currentDefence}</p>
      <div className="action-container">
        {/* Only render actionPlayed if it's valid */}
        {teammate.actionPlayed && teammate.actionPlayed.name !== "No Action" && (
          <p
            className={`action-played action-${teammate.actionPlayed.type}`}
            key={teammate.actionPlayed.name}
          >
            {teammate.actionPlayed.name}
          </p>
        )}
      </div>

      {/* Action Dots representing the timeline */}
      {!enemy && <div className="timeline-dots">
        {teammate.timeline.map((action, actionIndex) => (
          <span
            key={actionIndex}
            className={`dot ${
              actionIndex === currentActionIndex ? "current" : ""
            }`}
          />
        ))}
      </div> }
      
    </div>
  );
};

export default CharacterCard;
