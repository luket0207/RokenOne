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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

    // Update the character's action pool with the upgraded action
    const updatedActionPool = character.actionPool.map((a) =>
      a.id === action.id ? { ...a, level: a.level + 1 } : a
    );

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
    closeModal();
  };

  // Filter available actions based on character's class or 'All' class
  const availableActions = cardBank.filter(
    (action) => action.class === "All" || action.class === character.class // Filter for 'All' class or character's class
  );

  return (
    <div className="edit-container">
      <h1>Edit {character.name}</h1>
      <p className="edit-text">
        Drag actions from the left into your timeline. Timeline is played from
        the top down.
      </p>

      <div className="edit-timeline-grid">
        <div className="action-pool">
          <div className="action-add" onClick={openModal}>
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

      <Modal isOpen={isModalOpen} onClose={closeModal}>
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
    </div>
  );
};

export default Edit;
