import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useDrag, useDrop } from "react-dnd";
import "./Timeline.scss";

const ItemType = {
  ACTION: "action",
};

const Timeline = () => {
  const { characterId } = useParams(); // Gets characterId from URL params
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const navigate = useNavigate(); // Initialize navigate function

  // Convert characterId from string to number
  const character = playerTeam.find((char) => char.id === Number(characterId));

  // If no character found, show a loading/error message
  if (!character) {
    return <div>Character not found or not selected yet!</div>;
  }

  // Handle dropping action into the timeline
  const handleDrop = (action, index) => {
    // Respect timeline slots
    if (index >= character.timelineSlots) return;

    // Fill empty slots with null to match timeline slots
    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) => character.timeline[idx] || null);

    // If the slot already has an action, move it back to the action pool
    const actionBeingReplaced = newTimeline[index];
    let updatedActionPool = [...character.actionPool];

    if (actionBeingReplaced) {
      // Add the replaced action back to the action pool
      updatedActionPool = [...updatedActionPool, actionBeingReplaced];
    }

    // Place the new action into the correct slot
    newTimeline[index] = action;

    const updatedCharacter = {
      ...character,
      timeline: newTimeline,
      actionPool: updatedActionPool.filter((a) => a.id !== action.id), // Remove the dragged action from the pool
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

  const handleReturnToPool = (action) => {
    // Find the index of the action in the timeline
    const newTimeline = character.timeline.map((a) =>
      a && a.id === action.id ? null : a
    );

    const updatedCharacter = {
      ...character,
      timeline: newTimeline, // Remove action from the specific slot

      actionPool: [...character.actionPool, action], // Add action back to the pool
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

  // Drag-and-drop setup
  const Action = ({ action }) => {
    const [, drag] = useDrag({
      type: ItemType.ACTION,
      item: { action },
    });
    return (
      <div
        ref={drag}
        className={`action-item ${action.locked ? "disabled" : ""}`}
      >
        <p>{action.name}</p>
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
        style={{ backgroundColor: isOver ? "lightgreen" : "white" }}
      >
        {action ? (
          <div>
            {action.name}
            <button onClick={() => handleReturnToPool(action)}>Remove</button>
          </div>
        ) : (
          <div>Empty Slot</div>
        )}
      </div>
    );
  };

  // Handle navigation back to home screen
  const handleGoHome = () => {
    navigate("/home"); // Navigates to the home route
  };

  return (
    <div className="timeline-container">
      {/* Timeline */}
      <h1>{character.name}'s Timeline</h1>
      <h3>Timeline (Slots: {character.timelineSlots}):</h3>
      <ul className="timeline">
        {Array.from({ length: character.timelineSlots }).map((_, index) => (
          <li key={index}>
            <TimelineSlot
              action={character.timeline[index] || null}
              index={index}
            />
          </li>
        ))}
      </ul>

      {/* Action Pool */}
      <h3>Action Pool:</h3>
      <div className="action-pool">
        {character.actionPool
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((action) => (
            <Action action={action} />
          ))}
      </div>

      {/* Button to navigate back to Home */}
      <button onClick={handleGoHome}>Back to Home</button>
    </div>
  );
};

export default Timeline;
