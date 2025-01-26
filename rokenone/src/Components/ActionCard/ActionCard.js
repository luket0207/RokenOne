import React from "react";
import "./ActionCard.scss";

const ActionCard = ({action, noAnimation}) => {
  // Function to generate description based on action attributes
  const generateDescription = (action) => {
    let description = [];

    // Handle the attack and defence properties
    if (action.attack) {
      description.push(`Attack ${action.attack}`);
    } if (action.defence) {
      description.push(`Defence ${action.defence}`);
    } if (action.heal) {
      description.push(`Heal ${action.heal}`);
    } if (action.healAll) {
      description.push(`Heal All ${action.healAll}`);
    } if (action.charge) {
      description.push(`Charge ${action.charge}`);
    } if (action.illusion) {
      description.push(`Illusion ${action.illusion}`);
    } if (action.buffAttack) {
      description.push(`Buff Attack ${action.buffAttack}`);
    } if (action.buffDefence) {
      description.push(`Buff Defence ${action.buffDefence}`);
    } if (action.attackAll) {
      description.push(`Attack All ${action.attackAll}`);
    } if (action.defenceAll) {
      description.push(`Defence All ${action.defenceAll}`);
    }

    // Handle the weatherBoostEffect and weatherBoost properties
    if (action.weatherBoost && action.weatherBoostEffect.length > 0) {
      const weatherEffect = action.weatherBoostEffect[0];
      description.push(
        `Plus ${weatherEffect[1]} ${weatherEffect[0]} if ${action.weatherBoost}.`
      );
    }

    // Join the description array with <br /> for line breaks
    return description.join("<br />");
  };

  return (
    <div className={`action-item ${!noAnimation ? `animate` : ""} ${action.locked ? "disabled" : ""} rarity-${action.rarity}`}>
      <h5>{action.name} {action.level > 0 && `(${action.level})`}</h5>
      {action.quantity > 1 && <div className="action-quantity">
        <p>{action.quantity}</p>
      </div>}
      {/* Render description with dangerouslySetInnerHTML to parse the HTML line breaks */}
      <p
        className="small-text"
        dangerouslySetInnerHTML={{ __html: generateDescription(action) }}
      ></p>
    </div>
  );
};

export default ActionCard;
