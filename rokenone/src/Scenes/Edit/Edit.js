import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useDrag, useDrop } from "react-dnd";
import "./Edit.scss"; // Make sure the styles are applied
import Button from "../../Components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import ActionCard from "../../Components/ActionCard/ActionCard";
import Modal from "../../Components/Modal/Modal";
import weaponsData from "../../Data/Weapons/Weapons.json";

const ItemType = {
  ACTION: "action",
};

const Edit = () => {
  const { navString, characterId } = useParams();
  const { playerTeam, setPlayerTeam, playerData, setPlayerData } =
    useContext(GameDataContext);
  const navigate = useNavigate();

  const character = playerTeam.find((char) => char.id === Number(characterId));
  const cardBank = playerData.cardBank || [];

  const [isActionSelectionModalOpen, setIsActionSelectionModalOpen] =
    useState(false);

  const openActionSelectionModal = () => setIsActionSelectionModalOpen(true);
  const closeActionSelectionModal = () => setIsActionSelectionModalOpen(false);

  const [isWeaponSelectionModalOpen, setIsWeaponSelectionModalOpen] =
    useState(false);

  useEffect(() => {
    console.log("Updated playerTeam:", playerTeam);
  }, [playerTeam]);

  const closeWeaponSelectionModal = () => {
    // Reset the selectedWeapon and selectedActions (optional, based on your use case)
    setIsWeaponSelectionModalOpen(false);
  };
  const openWeaponSelectionModal = () => {
    // Reset the selectedWeapon and selectedActions (optional, based on your use case)
    setIsWeaponSelectionModalOpen(true);
  };

  if (!character) {
    return <div>Character not found or not selected yet!</div>;
  }

  const handleDrop = (action, index) => {
    if (index >= character.timelineSlots) return;

    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) => character.timeline[idx] || null);

    const replacedAction = newTimeline[index];
    let updatedActionPool = [...character.actionPool];

    if (replacedAction) {
      updatedActionPool = updatedActionPool.map((a) =>
        a.id === replacedAction.id ? { ...a, locked: false } : a
      );
    }

    updatedActionPool = updatedActionPool.map((a) =>
      a.id === action.id ? { ...a, locked: true } : a
    );

    newTimeline[index] = action;

    const updatedCharacter = {
      ...character,
      timeline: newTimeline,
      actionPool: updatedActionPool,
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

  const handleReturnToPool = (action) => {
    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) =>
        character.timeline[idx] && character.timeline[idx].id === action.id
          ? null
          : character.timeline[idx]
      );

    const updatedActionPool = character.actionPool.map((a) =>
      a.id === action.id ? { ...a, locked: false } : a
    );

    const updatedCharacter = {
      ...character,
      timeline: newTimeline,
      actionPool: updatedActionPool,
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

  const handleUpgrade = (action) => {
    const cardBankAction = cardBank.find((c) => c.id === action.id);

    if (!cardBankAction || cardBankAction.quantity < action.level + 1) {
      alert("Not enough cards in the cardBank to upgrade!");
      return;
    }

    // Update the cardBank by reducing the quantity of the action
    const updatedCardBank = cardBank
      .map((c) =>
        c.id === action.id
          ? { ...c, quantity: c.quantity - (action.level + 1) }
          : c
      )
      .filter((c) => c.quantity > 0); // Remove actions with 0 quantity

    // Apply upgrades to the action
    const applyUpgrades = (action) => {
      // Define the list of attributes to check
      const checkAttributes = [
        "attack",
        "defence",
        "attackAll",
        "defenceAll",
        "heal",
        "healAll",
        "buffAttack",
        "buffDefence",
        "buffHeal",
        "attackWeaponBoost",
      ];

      // Determine which upgrade to apply based on the current level
      const upgradeIndex = action.level % action.upgrade.length;

      // Apply the upgrade at the calculated index
      const [attribute, upgradeValue] = action.upgrade[upgradeIndex];

      if (attribute === "manaBoostEffect") {
        // Upgrade manaBoostEffect value (third element in array)
        if (
          Array.isArray(action.manaBoostEffect) &&
          action.manaBoostEffect[0]
        ) {
          action.manaBoostEffect[0][2] += upgradeValue; // Increase the numerical value
        }
      } else if (attribute === "manaBoostEffect2") {
        // Upgrade manaBoostEffect value (third element in array)
        if (
          Array.isArray(action.manaBoostEffect) &&
          action.manaBoostEffect[1]
        ) {
          action.manaBoostEffect[1][2] += upgradeValue; // Increase the numerical value
        }
      } else if (attribute === "cycleBoostEffect") {
        // Upgrade cycleBoostEffect value (third element in array)
        if (
          Array.isArray(action.cycleBoostEffect) &&
          action.cycleBoostEffect[0]
        ) {
          action.cycleBoostEffect[0][2] += upgradeValue; // Increase the numerical value
        }
      } else if (attribute === "cycleBoostEffect2") {
        // Upgrade cycleBoostEffect value (third element in array)
        if (
          Array.isArray(action.cycleBoostEffect) &&
          action.cycleBoostEffect[1]
        ) {
          action.cycleBoostEffect[1][2] += upgradeValue; // Increase the numerical value
        }
      } else if (attribute === "all") {
        // If the attribute is "all", increment all applicable attributes
        checkAttributes.forEach((attr) => {
          // Check if the attribute is not null or 0
          if (action[attr] !== null && action[attr] !== 0) {
            action[attr] += upgradeValue; // Increment the attribute by the upgrade value
          }
        });

        // Also check if any of the boost effects match and should be upgraded
        if (Array.isArray(action.manaBoostEffect)) {
          action.manaBoostEffect.forEach((effect) => {
            if (checkAttributes.includes(effect[0]) && effect[1] === "plus") {
              effect[2] += upgradeValue; // Increment the effect value
            }
          });
        }

        if (Array.isArray(action.cycleBoostEffect)) {
          action.cycleBoostEffect.forEach((effect) => {
            if (checkAttributes.includes(effect[0]) && effect[1] === "plus") {
              effect[2] += upgradeValue; // Increment the effect value
            }
          });
        }
      } else {
        // Upgrade the appropriate attribute
        action[attribute] += upgradeValue;
      }
    };

    // Update the character's action pool with the upgraded action
    const updatedActionPool = character.actionPool.map((a) => {
      if (a.id === action.id) {
        const upgradedAction = { ...a, level: a.level + 1 };
        applyUpgrades(upgradedAction); // Apply upgrades to the action
        return upgradedAction;
      }
      return a;
    });

    const updatedPlayerData = {
      ...playerData,
      cardBank: updatedCardBank,
    };

    const updatedCharacter = {
      ...character,
      actionPool: updatedActionPool,
    };

    // Update the state with the new character and player data
    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );

    setPlayerData(updatedPlayerData);
  };

  const Action = ({ action }) => {
    const [, drag] = useDrag({
      type: ItemType.ACTION,
      item: { action },
      canDrag: () => !action.locked,
    });

    const cardBankAction = cardBank.find((c) => c.id === action.id);
    const cardsNeeded = action.level + 1;
    const canUpgrade = cardBankAction && cardBankAction.quantity >= cardsNeeded;
    const additionalCardsNeeded = cardBankAction
      ? cardsNeeded - cardBankAction.quantity
      : cardsNeeded;

    return (
      <div className="edit-action" ref={drag}>
        <ActionCard action={action} />
        <div
          onClick={() => canUpgrade && handleUpgrade(action)}
          className={`upgrade-button ${!canUpgrade ? "disabled" : ""}`}
        >
          {canUpgrade ? (
            <p>Upgrade {`(${action.level + 1})`}</p>
          ) : (
            <p>{additionalCardsNeeded} more needed</p>
          )}
        </div>
      </div>
    );
  };

  const TimelineSlot = ({ action, index }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemType.ACTION,
      drop: (item) => handleDrop(item.action, index),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    return (
      <div
        ref={drop}
        className={`timeline-slot ${action ? "filled" : ""}`}
        style={{ backgroundColor: isOver ? "#333" : "white" }}
      >
        {action ? (
          <div className="timeline-slot-action">
            <ActionCard action={action} noAnimation={true} />
            <div
              className="timeline-slot-remove"
              onClick={() => handleReturnToPool(action)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </div>
          </div>
        ) : (
          <div>
            {isOver ? (
              <p className="timeline-slot-text" style={{ color: "white" }}>
                Add to Timeline
              </p>
            ) : (
              <p
                className="timeline-slot-text timeline-slot-empty"
                style={{ color: "#333" }}
              >
                Empty Slot
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleGoHome = () => {
    if (navString === "e") {
      navigate("/expeditionhome");
    } else if (navString === "t") {
      navigate("/editteam");
    }
  };

  const addToCharacter = (id) => {
    // Find the action from the cardBank
    const actionToAdd = cardBank.find((action) => action.id === id);

    if (!actionToAdd || actionToAdd.quantity <= 0) {
      alert("Not enough cards to add this action.");
      return;
    }

    // Check if the action is a weapon
    if (actionToAdd.type === "weapon") {
      // Create a copy of the weapon with quantity set to 0
      const newWeapon = { ...actionToAdd, quantity: 0 };

      // Check if the character already has a weapon
      if (
        character.weapon !== null &&
        Array.isArray(character.weapon) &&
        character.weapon.length > 0
      ) {
        const confirmWeaponChange = window.confirm(
          "Are you sure? Setting a new weapon will discard your current one. All cards will be lost permanently."
        );

        if (!confirmWeaponChange) {
          // If the user does not confirm, exit the function
          return;
        }
      }

      // If user confirmed or there is no current weapon, proceed to set the new weapon
      const updatedWeaponArray = [newWeapon]; // Replace with the new weapon

      // Update the character's weapon with the new weapon
      const updatedCharacter = {
        ...character,
        weapon: updatedWeaponArray, // Set weapon to the updated array
      };

      console.log("Updated Character with Weapon:", updatedCharacter); // Debugging

      // Update the cardBank by reducing the quantity of the weapon
      const updatedCardBank = cardBank
        .map((action) =>
          action.id === id
            ? { ...action, quantity: action.quantity - 1 }
            : action
        )
        .filter((action) => action.quantity > 0); // Remove actions with 0 quantity

      // Update the state with the new character and updated cardBank
      const updatedPlayerData = {
        ...playerData,
        cardBank: updatedCardBank,
      };

      // Update the team with the modified character
      setPlayerTeam((prevTeam) => {
        const updatedTeam = prevTeam.map((char) => {
          if (char.id === updatedCharacter.id) {
            // Replace the character with the updated one
            return { ...char, ...updatedCharacter };
          }
          return char;
        });
        return updatedTeam;
      });

      setPlayerData(updatedPlayerData);
      closeWeaponSelectionModal();
    } else {
      // For actions that are not weapons, add them to the action pool
      const newAction = { ...actionToAdd, quantity: 0 };

      // Add the new action to the character's actionPool
      const updatedActionPool = [...character.actionPool, newAction];

      // Update the cardBank by reducing the quantity of the action
      const updatedCardBank = cardBank
        .map((action) =>
          action.id === id
            ? { ...action, quantity: action.quantity - 1 }
            : action
        )
        .filter((action) => action.quantity > 0); // Remove actions with 0 quantity

      // Update the character and player data
      const updatedCharacter = {
        ...character,
        actionPool: updatedActionPool,
      };

      const updatedPlayerData = {
        ...playerData,
        cardBank: updatedCardBank,
      };

      // Update the state with the modified character and updated cardBank
      setPlayerTeam((prevTeam) => {
        const updatedTeam = prevTeam.map((char) => {
          if (char.id === updatedCharacter.id) {
            // Replace the character with the updated one
            return { ...char, ...updatedCharacter };
          }
          return char;
        });
        return updatedTeam;
      });

      setPlayerData(updatedPlayerData);
      closeActionSelectionModal();
    }
  };

  // Filter available actions based on character's class or 'All' class
  const availableActions = cardBank.filter(
    (action) => action.class === "All" || action.class === character.class // Filter for 'All' class or character's class
  );

  //WEAPONS STUFF///////////////////////

  const upgradeWeapon = () => {};

  return (
    <div className="edit-container">
      <h1>Edit {character.name}</h1>
      <p className="edit-text">
        Drag actions from the bottom list into the timeline at the top. Once you
        are done, you can just navigate back.
      </p>
      <div className="home-button">
        <Button text={"Back"} onClick={handleGoHome}></Button>
      </div>
      <div className="edit-timeline-grid">
        <div className="timeline-container">
          <div>
            <div className="timeline-container-items">
              <h3>Timeline</h3>
              <h3>Weapon</h3>
              <div className="timeline">
                {Array.from({ length: character.timelineSlots }).map(
                  (_, index) => (
                    <div key={index}>
                      <TimelineSlot
                        action={character.timeline[index] || null}
                        index={index}
                      />
                    </div>
                  )
                )}
              </div>
              <div className="edit-weapon">
                {character.weapon ? (
                  <div className="edit-weapon-info">
                    <div className="edit-weapon-info-card">
                      <ActionCard
                        action={character.weapon[0]}
                        noAnimation={true}
                      />
                    </div>
                    <div className="edit-weapon-info-buttons">
                      <Button
                        text={"Upgrade Weapon"}
                        onClick={upgradeWeapon}
                        type="secondary"
                        disabled={
                          !character.weapon && // Check if weapon is null
                          !character.actionPool.some(
                            (action) =>
                              action.type === "weapon" && !action.locked
                          )
                        }
                      />
                      <Button
                        text={"Change Weapon"}
                        onClick={openWeaponSelectionModal}
                        type="secondary"
                        disabled={
                          !character.weapon && // Check if weapon is null
                          !character.actionPool.some(
                            (action) =>
                              action.type === "weapon" && !action.locked
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    text={
                      !character.weapon &&
                      !character.actionPool.some(
                        (action) => action.type === "attack" && !action.locked
                      )
                        ? "No Available Attack Moves"
                        : "Select Weapon"
                    }
                    onClick={openWeaponSelectionModal}
                    type="secondary"
                    disabled={
                      !character.weapon &&
                      !character.actionPool.some(
                        (action) => action.type === "attack" && !action.locked
                      )
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="action-pool">
          <div className="action-add" onClick={openActionSelectionModal}>
            <div className="action-add-icon">
              <FontAwesomeIcon icon={faPlusCircle} />
            </div>
          </div>
          {character.actionPool
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((action) => (
              <Action key={action.id} action={action} />
            ))}
        </div>
      </div>

      <div className="home-button">
        <Button text={"Back"} onClick={handleGoHome}></Button>
      </div>

      <Modal
        isOpen={isActionSelectionModalOpen}
        onClose={closeActionSelectionModal}
      >
        <div className="add-action">
          <h3>Add New Action to {character.name}</h3>
          <div className="available-actions">
            {availableActions.filter(
              (action) =>
                action.type !== "weapon" &&
                !character.actionPool.some(
                  (poolAction) => poolAction.id === action.id
                )
            ).length > 0 ? (
              availableActions
                .filter(
                  (action) =>
                    action.type !== "weapon" &&
                    !character.actionPool.some(
                      (poolAction) => poolAction.id === action.id
                    )
                )
                .map((action) => (
                  <div
                    key={action.id}
                    className="available-actions-action"
                    onClick={() => addToCharacter(action.id)}
                  >
                    <ActionCard action={action} />
                    <span className="available-actions-action-icon">
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </span>
                  </div>
                ))
            ) : (
              <p>No available actions to add.</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isWeaponSelectionModalOpen}
        onClose={closeWeaponSelectionModal}
      >
        <div className="weapon-selection">
          <h3>Select a Weapon</h3>
          <div className="available-weapons">
            {availableActions.filter(
              (action) =>
                action.type === "weapon" &&
                (!character.weapon || character.weapon[0]?.id !== action.id) && // Exclude current weapon
                !character.actionPool.some(
                  (poolAction) => poolAction.id === action.id
                )
            ).length > 0 ? (
              availableActions
                .filter(
                  (action) =>
                    action.type === "weapon" &&
                    (!character.weapon ||
                      character.weapon[0]?.id !== action.id) && 
                    !character.actionPool.some(
                      (poolAction) => poolAction.id === action.id
                    )
                )
                .map((action) => (
                  <div
                    key={action.id}
                    className="available-weapons-action"
                    onClick={() => addToCharacter(action.id)}
                  >
                    <ActionCard action={action} />
                    <span className="available-actions-action-icon">
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </span>
                  </div>
                ))
            ) : (
              <p>No available weapons to add.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Edit;
