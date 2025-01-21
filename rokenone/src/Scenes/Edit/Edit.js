import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useDrag, useDrop } from "react-dnd";
import "./Edit.scss"; // Make sure the styles are applied
import Button from "../../Components/Button/Button";
import Carousel from "../../Components/Carousel/Carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ItemType = {
  ACTION: "action",
};

const Edit = () => {
  const { characterId } = useParams();
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const navigate = useNavigate();

  const character = playerTeam.find((char) => char.id === Number(characterId));

  if (!character) {
    return <div>Character not found or not selected yet!</div>;
  }

  const handleDrop = (action, index) => {
    if (index >= character.timelineSlots) return;

    // Ensure the timeline length matches character.timelineSlots
    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) => character.timeline[idx] || null);

    // Find the existing action in the slot (if any) and unlock it
    const replacedAction = newTimeline[index];
    let updatedActionPool = [...character.actionPool];

    if (replacedAction) {
      // Unlock the replaced action by setting locked to false
      updatedActionPool = updatedActionPool.map((a) =>
        a.id === replacedAction.id ? { ...a, locked: false } : a
      );
    }

    // Lock the new action being added to the timeline
    updatedActionPool = updatedActionPool.map((a) =>
      a.id === action.id ? { ...a, locked: true } : a
    );

    // Place the new action in the timeline
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
    // Remove the action from the timeline but preserve the length with nulls
    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) =>
        character.timeline[idx] && character.timeline[idx].id === action.id
          ? null
          : character.timeline[idx]
      );

    // Unlock the action when it is returned to the pool
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

  // Function to generate description based on action attributes
  const generateDescription = (action) => {
    let description = [];

    // Handle the attack and defence properties
    if (action.attack) {
      description.push(`Attack ${action.attack}`);
    } else if (action.defence) {
      description.push(`Defence ${action.defence}`);
    } else if (action.heal) {
      description.push(`Heal ${action.heal}`);
    } else if (action.healAll) {
      description.push(`Heal All ${action.healAll}`);
    } else if (action.charge) {
      description.push(`Charge ${action.charge}`);
    } else if (action.illusion) {
      description.push(`Illusion ${action.illusion}`);
    } else if (action.buffAttack && action.buffDefence) {
      description.push(
        `Buff Attack ${action.buffAttack}, Buff Defence ${action.buffDefence}`
      );
    } else if (action.attackAll) {
      description.push(`Attack All ${action.attackAll}`);
    } else if (action.defenceAll) {
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

  const Action = ({ action }) => {
    const [, drag] = useDrag({
      type: ItemType.ACTION,
      item: { action },
      canDrag: () => !action.locked, // Prevent dragging of disabled actions
    });

    return (
      <div
        ref={drag}
        className={`action-item ${action.locked ? "disabled" : ""}`}
      >
        <h5>{action.name}</h5>
        {/* Render description with dangerouslySetInnerHTML to parse the HTML line breaks */}
        <p
          className="small-text"
          dangerouslySetInnerHTML={{ __html: generateDescription(action) }}
        ></p>
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
            <div className="timeline-slot-remove" onClick={() => handleReturnToPool(action)}>
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
              <p className="timeline-slot-text timeline-slot-empty" style={{ color: "#333" }}>
                Empty Slot
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleGoExpeditionHome = () => {
    navigate("/expeditionhome");
  };

  return (
    <div className="edit-container">
      <h1>Edit {character.name}</h1>
      <p className="edit-text">Drag actions from the left into your timeline. Timeline is played from the top down.</p>

      <div className="edit-timeline-grid">
        <div className="action-pool">
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
      {/* Make this container horizontally scrollable */}

      <div className="home-button">
        <Button text={"Back to Home"} onClick={handleGoExpeditionHome}></Button>
      </div>
    </div>
  );
};

export default Edit;
