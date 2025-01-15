import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { useDrag, useDrop } from "react-dnd";
import "./Timeline.scss"; // Make sure the styles are applied
import Button from "../../Components/Button/Button";

const ItemType = {
  ACTION: "action",
};

const Timeline = () => {
  const { characterId } = useParams();
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const navigate = useNavigate();

  const character = playerTeam.find((char) => char.id === Number(characterId));

  if (!character) {
    return <div>Character not found or not selected yet!</div>;
  }

  const handleDrop = (action, index) => {
    if (index >= character.timelineSlots) return;

    const newTimeline = Array(character.timelineSlots)
      .fill(null)
      .map((slot, idx) => character.timeline[idx] || null);

    const actionBeingReplaced = newTimeline[index];
    let updatedActionPool = [...character.actionPool];

    if (actionBeingReplaced) {
      updatedActionPool = [...updatedActionPool, actionBeingReplaced];
    }

    newTimeline[index] = action;

    const updatedCharacter = {
      ...character,
      timeline: newTimeline,
      actionPool: updatedActionPool.filter((a) => a.id !== action.id),
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

  const handleReturnToPool = (action) => {
    const newTimeline = character.timeline.map((a) =>
      a && a.id === action.id ? null : a
    );

    const updatedCharacter = {
      ...character,
      timeline: newTimeline,
      actionPool: [...character.actionPool, action],
    };

    setPlayerTeam((prevTeam) =>
      prevTeam.map((char) =>
        char.id === character.id ? updatedCharacter : char
      )
    );
  };

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
        style={{ backgroundColor: isOver ? "#333" : "white" }}
      >
        {action ? (
          <div className="timeline-slot-action">
            <p>{action.name}</p>
            <Button
              text={"Remove"}
              type={"small"}
              onClick={() => handleReturnToPool(action)}
            ></Button>
          </div>
        ) : (
          <div>Empty Slot</div>
        )}
      </div>
    );
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="timeline-container">
      <h1>{character.name}'s Timeline</h1>
      <h3>Timeline (Slots: {character.timelineSlots}):</h3>
      <div className="timeline">
        {Array.from({ length: character.timelineSlots }).map((_, index) => (
          <div key={index}>
            <TimelineSlot
              action={character.timeline[index] || null}
              index={index}
            />
          </div>
        ))}
      </div>

      <h3 className="action-title">Action Pool:</h3>
      <p>Drag moves from below into your timeline</p>
      {/* Make this container horizontally scrollable */}
      <div className="action-pool">
        {character.actionPool
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((action) => (
            <Action key={action.id} action={action} />
          ))}
      </div>
      <div className="home-button">
        <Button text={"Back to Home"} onClick={handleGoHome}></Button>
      </div>
    </div>
  );
};

export default Timeline;
