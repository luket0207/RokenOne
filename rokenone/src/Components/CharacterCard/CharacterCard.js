// CharacterCard.js
import React from "react";
import "./CharacterCard.scss";

const CharacterCard = ({ teammate, currentActionIndex }) => {
  return (
    <div className="battle-pod-details">
      <h2>{teammate.name}</h2>
      <p>Health: {teammate.health}</p>
      <p>Defence: {teammate.currentDefence}</p>

      {/* Charge bar */}
      {/* <div className="charge-bar-container">
        <div
          className="charge-bar"
          style={{
            width: `${(teammate.currentCharge / 10) * 100}%`, // Percentage based on max 10 charge
          }}
        />
      </div> */}

      <div className="action-container">
        {/* Only render actionPlayed if it's valid */}
        {teammate.actionPlayed && teammate.actionPlayed.name !== "" && (
          <p
            className={`action-played action-${teammate.actionPlayed.type}`}
            key={teammate.actionPlayed.name}
          >
            {teammate.actionPlayed.name}
          </p>
        )}
      </div>

      {/* Action Dots representing the timeline */}
      {teammate.timeline && <div className="timeline-dots">
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
