import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useDrag, useDrop } from "react-dnd";
import "./Edit.scss"; // Make sure the styles are applied
import Button from "../../Components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPlusCircle,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
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
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);

  const character = playerTeam.find((char) => char.id === Number(characterId));
  const cardBank = playerData.cardBank || [];

  const [isActionSelectionModalOpen, setIsActionSelectionModalOpen] =
    useState(false);

  const openActionSelectionModal = () => setIsActionSelectionModalOpen(true);
  const closeActionSelectionModal = () => setIsActionSelectionModalOpen(false);

  const [isWeaponSelectionModalOpen, setIsWeaponSelectionModalOpen] =
    useState(false);

  const closeWeaponSelectionModal = () => {
    // Unlock any actions that were locked by the weapon
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => {
        if (teammate.id === character.id) {
          // Iterate through the actionPool and unlock actions locked by the weapon
          const updatedActionPool = teammate.actionPool.map((a) =>
            a.lockedByWeapon
              ? { ...a, locked: false, lockedByWeapon: false }
              : a
          );

          // Return the updated teammate
          return { ...teammate, actionPool: updatedActionPool, weapon: null };
        }
        return teammate;
      })
    );

    // Reset the selectedWeapon and selectedActions (optional, based on your use case)
    setSelectedWeapon(null);
    setSelectedActions([]);
    setIsWeaponSelectionModalOpen(false);
  };
  const openWeaponSelectionModal = () => {
    // Unlock any actions that were locked by the weapon
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => {
        if (teammate.id === character.id) {
          // Iterate through the actionPool and unlock actions locked by the weapon
          const updatedActionPool = teammate.actionPool.map((a) =>
            a.lockedByWeapon
              ? { ...a, locked: false, lockedByWeapon: false }
              : a
          );

          // Return the updated teammate
          return { ...teammate, actionPool: updatedActionPool, weapon: null };
        }
        return teammate;
      })
    );

    // Reset the selectedWeapon and selectedActions (optional, based on your use case)
    setSelectedWeapon(null);
    setSelectedActions([]);
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
            <h5 className="timeline-slot-text">{action.name}</h5>
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

    // Create a copy of the action with quantity set to 0
    const newAction = { ...actionToAdd, quantity: 0 };

    // Add the new action to the character's actionPool
    const updatedActionPool = [...character.actionPool, newAction];

    // Update the cardBank by reducing the quantity of the action
    const updatedCardBank = cardBank
      .map((action) =>
        action.id === id ? { ...action, quantity: action.quantity - 1 } : action
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

    // Update the state
    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
    setPlayerData(updatedPlayerData);
    closeActionSelectionModal();
  };

  // Filter available actions based on character's class or 'All' class
  const availableActions = cardBank.filter(
    (action) => action.class === "All" || action.class === character.class // Filter for 'All' class or character's class
  );

  //WEAPONS STUFF///////////////////////

  // Handle weapon selection
  const handleWeaponSelect = (weapon) => {
    setSelectedWeapon(weapon);

    // Remove all selected actions when a new weapon is selected
    setSelectedActions([]);

    // Unlock all actions in the character's actionPool that were locked by the weapon
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => {
        if (teammate.id === character.id) {
          // Iterate through the actionPool and unlock actions locked by the weapon
          const updatedActionPool = teammate.actionPool.map((a) => ({
            ...a,
            locked: a.lockedByWeapon ? false : a.locked, // Only unlock if locked by weapon
            lockedByWeapon: false, // Reset lockedByWeapon flag
          }));

          // Return the updated teammate with the actionPool and weapon reset
          return { ...teammate, actionPool: updatedActionPool, weapon: null };
        }
        return teammate;
      })
    );
  };

  const handleActionSelect = (action) => {
    // Check if there's room in selected actions based on the weapon slots
    if (selectedActions.length < selectedWeapon.slots) {
      // Add the selected action to selectedActions
      setSelectedActions((prevActions) => [...prevActions, action]);

      // Lock the action in the character's actionPool and mark it as locked by the weapon
      setPlayerTeam((prevTeam) =>
        prevTeam.map((teammate) => {
          if (teammate.id === character.id) {
            // Update the action in the actionPool to mark it as locked by the weapon
            const updatedActionPool = teammate.actionPool.map((a) =>
              a.id === action.id
                ? { ...a, locked: true, lockedByWeapon: true }
                : a
            );

            // Return the updated teammate with the actionPool modified
            return { ...teammate, actionPool: updatedActionPool };
          }
          return teammate;
        })
      );
    }
  };

  // Handle removing action from selected actions
  const handleActionRemove = (action) => {
    // Remove the action from selectedActions
    setSelectedActions((prevActions) =>
      prevActions.filter((selectedAction) => selectedAction.id !== action.id)
    );

    // Unlock the action in the character's actionPool, but only if it was locked by the weapon
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => {
        if (teammate.id === character.id) {
          // Update the action within the teammate's actionPool
          const updatedActionPool = teammate.actionPool.map((a) =>
            a.id === action.id && a.lockedByWeapon
              ? { ...a, locked: false, lockedByWeapon: false }
              : a
          );

          // Return the updated teammate with the actionPool modified
          return {
            ...teammate,
            actionPool: updatedActionPool,
            weapon: null,
          };
        }
        return teammate;
      })
    );
  };

  const handleApplySelection = () => {
    if (!selectedWeapon || selectedActions.length !== selectedWeapon.slots) {
      alert("Please select enough actions to fill all slots.");
      return;
    }

    // Calculate total attack from the selected actions
    const totalAttack = selectedActions.reduce((total, action) => {
      return total + (action.attack || 0) + (action.attackAll || 0); // Sum attack and attackAll values
    }, 0);

    // Get the attackWeaponBoost, defaulting to 0 if not present
    const attackWeaponBoost = selectedActions.reduce((boost, action) => {
      return boost + (action.attackWeaponBoost || 0); // Sum attackWeaponBoost values
    }, 0);

    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => {
        // Ensure we're updating the correct character by checking their ID
        if (teammate.id === character.id) {
          // If the character already has a weapon, replace it with the new one
          const updatedWeapon = teammate.weapon
            ? [
                {
                  ...teammate.weapon[0],
                  name: selectedWeapon.name,
                  chargeCost: selectedWeapon.chargeCost,
                  attack: totalAttack, // Apply total attack
                  attackBoost: attackWeaponBoost, // Apply attackWeaponBoost
                },
              ]
            : [
                {
                  ...selectedWeapon,
                  name: selectedWeapon.name,
                  chargeCost: selectedWeapon.chargeCost,
                  attack: totalAttack, // Apply total attack
                  attackBoost: attackWeaponBoost, // Apply attackWeaponBoost
                },
              ];

          return {
            ...teammate,
            weapon: updatedWeapon, // Add or replace the weapon for the teammate
          };
        }
        return teammate;
      })
    );

    setIsWeaponSelectionModalOpen(false); // Close the modal
  };

  return (
    <div className="edit-container">
      <h1>Edit {character.name}</h1>
      <p className="edit-text">
        Drag actions from the left into your timeline. Timeline is played from
        the top down.
      </p>
      <div className="edit-weapon">
        {character.weapon ? (
          <div className="edit-weapon-info">
            <p>Weapon: {character.weapon[0].name}</p>
            <p>Charge Cost: {character.weapon[0].chargeCost}</p>
            <p>
              Attack:{" "}
              {character.weapon[0].attack + character.weapon[0].attackBoost}
            </p>
            <Button
              text={"Change Weapon"}
              onClick={openWeaponSelectionModal}
              disabled={
                !character.weapon && // Check if weapon is null
                !character.actionPool.some(
                  (action) => action.type === "attack" && !action.locked
                )
              }
            />
          </div>
        ) : (
          <Button
            text={"Select Weapon"}
            onClick={openWeaponSelectionModal}
            disabled={
              !character.weapon && // Check if weapon is null
              !character.actionPool.some(
                (action) => action.type === "attack" && !action.locked
              )
            }
          />
        )}
      </div>

      <div className="edit-timeline-grid">
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
        <div className="timeline">
          <div>
            <h3>Timeline</h3>
          </div>
          {Array.from({ length: character.timelineSlots }).map((_, index) => (
            <div key={index}>
              <TimelineSlot
                action={character.timeline[index] || null}
                index={index}
              />
            </div>
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
                !character.actionPool.some(
                  (poolAction) => poolAction.id === action.id
                )
            ).length > 0 ? (
              availableActions
                .filter(
                  (action) =>
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
          <div className="weapon-selection-weapons">
            {weaponsData.map((weapon) => (
              <div
                key={weapon.id}
                className={`weapon-item ${
                  selectedWeapon && selectedWeapon.id === weapon.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleWeaponSelect(weapon)}
              >
                <h4>{weapon.name}</h4>
                <p>{weapon.description}</p>
              </div>
            ))}

            <p>
              Selected Weapon: {selectedWeapon && <>{selectedWeapon.name}</>}
            </p>
          </div>

          {selectedWeapon && (
            <div className="weapon-selection-actions">
              <h3>
                Select {selectedWeapon.slots} Attacks to put into the weapon.
              </h3>
              <p>
                The weapon will trigger these attack every time the weapon hits.
                Weapons never attack all.
              </p>
              <div className="available-actions">
                {character.actionPool
                  .filter(
                    (action) => action.type === "attack" && !action.locked
                  )
                  .map((action) => (
                    <div
                      key={action.id}
                      className="available-actions-action"
                      onClick={() => handleActionSelect(action)}
                    >
                      <ActionCard action={action} />
                      {selectedActions.some(
                        (selectedAction) => selectedAction.id === action.id
                      ) && (
                        <span
                          className="available-actions-action-icon"
                          onClick={() => handleActionRemove(action)}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="selected-actions">
            <h4>Selected Actions</h4>
            <ul>
              {selectedActions.map((action) => (
                <li key={action.id}>
                  <h5>{action.name}</h5>
                  <p>{action.description}</p>
                  <span onClick={() => handleActionRemove(action)}>Remove</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="weapon-selection-footer">
            <Button
              text="Apply Selection"
              onClick={handleApplySelection}
              disabled={
                !selectedWeapon ||
                selectedActions.length !== selectedWeapon.slots
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Edit;
