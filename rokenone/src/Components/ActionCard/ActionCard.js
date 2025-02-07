import React from "react";
import "./ActionCard.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandFist,
  faShieldHalved,
  faHeart,
  faBolt,
  faArrowUpRightDots,
  faHandSparkles,
  faScrewdriver,
} from "@fortawesome/free-solid-svg-icons";

const ActionCard = ({ action = {}, noAnimation }) => {
  // Function to generate description based on action attributes
  const generateDescription = (action) => {
    let description = [];

    // Handle the attack and defence properties
    if (action.attack) {
      description.push(`Attack ${action.attack}`);
    }
    if (action.defence) {
      description.push(`Defence ${action.defence}`);
    }
    if (action.heal) {
      description.push(`Heal ${action.heal}`);
    }
    if (action.charge) {
      description.push(`Charge ${action.charge}`);
    }
    if (action.illusion) {
      description.push(`Illusion ${action.illusion}`);
    }
    if (action.buffAttack) {
      description.push(`Buff Attack ${action.buffAttack}`);
    }
    if (action.buffDefence) {
      description.push(`Buff Defence ${action.buffDefence}`);
    }
    if (action.buffHeal) {
      description.push(`Buff Heal ${action.buffHeal}`);
    }
    if (action.attackAll) {
      description.push(`Attack All ${action.attackAll}`);
    }
    if (action.defenceAll) {
      description.push(`Defence All ${action.defenceAll}`);
    }
    if (action.healAll) {
      description.push(`Heal All ${action.healAll}`);
    }
    if (action.chargeCost) {
      description.push(`Charge Cost ${action.chargeCost}`);
    }
    if (action.attackWeaponBoost) {
      description.push(`
        Will add ${action.attackWeaponBoost} if placed in a weapon
      `);
    }

    // Handle the manaBoostEffect and manaBoost properties
    if (action.manaBoost && action.manaBoostEffect.length > 0) {
      action.manaBoostEffect.forEach((manaEffect) => {
        description.push(`
          ${manaEffect[0]} ${manaEffect[1]} ${manaEffect[2]} if ${action.manaBoost}.
        `);
      });
    }

    // Handle the classBoostEffect and classBoost properties
    if (
      action.classBoost &&
      Array.isArray(action.classBoostEffect) &&
      action.classBoostEffect.length > 0
    ) {
      action.classBoostEffect.forEach((classEffect) => {
        description.push(`
      ${classEffect[0]} ${classEffect[1]} ${classEffect[2]} if used by ${action.classBoost}.
    `);
      });
    }

    // Handle the cycleBoostEffect and cycleBoost properties
if (
  action.cycleBoost &&
  Array.isArray(action.cycleBoostEffect) &&
  action.cycleBoostEffect.length > 0
) {
  action.cycleBoostEffect.forEach((cycleEffect) => {
    let cycleBoostDescription;

    // Determine the correct phrasing for the cycleBoost value
    if (action.cycleBoost === 1) {
      cycleBoostDescription = `the first time this action is played in battle.`;
    } else {
      cycleBoostDescription = `every ${action.cycleBoost} cycles.`;
    }

    // Check if the cycleEffect is related to chargeCost and handle accordingly
    if (cycleEffect[0] === "chargeCost") {
      description.push(
        `${cycleBoostDescription}, this weapon costs ${cycleEffect[2]} less charge when used.`
      );
    } else {
      // Handle other cycleBoostEffect descriptions
      description.push(
        `${cycleEffect[0]} ${cycleEffect[1]} ${cycleEffect[2]} ${cycleBoostDescription}`
      );
    }
  });
}


    // Join the description array with <br /> for line breaks
    return description.join("<br /><br />");
  };

  return (
    <div
      className={`action-item ${!noAnimation ? `animate` : ""} ${
        action.locked ? "disabled" : ""
      } ${action.lockedByWeapon ? "disabled-by-weapon" : ""}`}
    >
      <div
        className={`action-item-bar action-class-${
          action.classBoost ? action.classBoost : action.class
        }`}
      >
        <div className="action-item-bar-rarity">
          {[...Array(action.rarity + 1)].map((_, index) => (
            <div key={index} className="action-item-bar-rarity-dash"></div>
          ))}
        </div>
        <div>
          {action.level > 0 && (
            <div className="action-item-bar-circle action-item-bar-level">
              <p>{action.level}</p>
            </div>
          )}
        </div>
        {action.type === "weapon" && action.classBoost && (
          <div className="action-item-bar-circle action-item-bar-classBoost">
            <p>
              {action.classBoost
                ? action.classBoost.charAt(0).toUpperCase()
                : ""}
            </p>
          </div>
        )}
        <div
          className={`action-item-bar-circle action-item-bar-type ${
            action.type === "weapon" && "action-item-bar-circle-weapon"
          }`}
        >
          {action.type === "attack" && <FontAwesomeIcon icon={faHandFist} />}
          {action.type === "defence" && (
            <FontAwesomeIcon icon={faShieldHalved} />
          )}
          {action.type === "heal" && <FontAwesomeIcon icon={faHeart} />}
          {action.type === "charge" && <FontAwesomeIcon icon={faBolt} />}
          {action.type === "buff" && (
            <FontAwesomeIcon icon={faArrowUpRightDots} />
          )}
          {action.type === "illusion" && (
            <FontAwesomeIcon icon={faHandSparkles} />
          )}
          {action.type === "weapon" && <FontAwesomeIcon icon={faScrewdriver} />}
        </div>
        {action.type !== "weapon" && (
          <>
            <div className="action-item-bar-circle action-item-bar-class">
              <p>{action.class ? action.class.charAt(0).toUpperCase() : ""}</p>
            </div>

            <div
              className={`action-item-bar-circle ${
                action.manaBoost === "none" ||
                (action.type === "weapon" && "no-mana")
              }`}
            >
              <div className={`mana-circle mana-${action.manaBoost}`}>
                {action.manaBoost === "dark" && <p>D</p>}
                {action.manaBoost === "light" && <p>L</p>}
              </div>
            </div>
          </>
        )}
      </div>
      <div
        className={`action-item-main ${
          action.type === "weapon" && "action-item-weapon"
        }`}
      >
        <div className="action-item-main-title">
          <h4>{action.name}</h4>
        </div>
        <p
          className="small-text"
          dangerouslySetInnerHTML={{ __html: generateDescription(action) }}
        ></p>
        {action.quantity > 1 && (
          <div className="action-item-main-quantity">
            <p>{action.quantity}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCard;
