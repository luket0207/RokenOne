import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button/Button";
import "./Help.scss";

const Help = () => {
  const navigate = useNavigate();

  const navigateHome = () => {
    navigate("/home");
  };
  return (
    <div className="help">
      <h1>Help</h1>
      <h3>Expeditions</h3>
      <p>
        Expeditions are your journey through the game. Generate one and then the
        game will remember it until you complete it or faint. Each day you will
        be offered a choice. That choice is played out then you move on to the
        next day. At the end there will be a boss battle too.
      </p>
      <h3>Your Team and Timelines</h3>
      <p>
        Each player starts with one character in their team, Roken. You can add
        more later but not in this version yet.
      </p>
      <p>
        Each character has their own timeline, this is how they play actions in
        battle. You need to fill the timelines with actions and they will be
        played in the order you put them in.
      </p>
      <p>
        If you are on Expedition Home and it won't let you continue. You should
        see a pulsing red ! on a character. That means you haven't set anything
        in that character's timeline.
      </p>
      <h3>Actions</h3>
      <ul>
        <li>Attack - Deal damage</li>
        <li>Defence - Add defence</li>
        <li>Heal - Heal health</li>
        <li>Charge - Add charge to use your weapon</li>
        <li>
          Illusion - has 3 levels, each level has a different chance of making a
          random enemy miss their action. Level 1: 25% chance, Level 2: 50%,
          Level 3: 75%.
        </li>
        <li>
          Buff - It's there and it works but you can only buff teammates so
          useless right now.{" "}
        </li>
      </ul>
      <h3>Battle Tips</h3>
      <p>
        In the battle you can do two things. You can target enemies by clicking
        on their card. This will make all your characters attack that enemy
        until it is dead.
      </p>
      <p>
        You can also use your weapon if you have the required charge. This will
        be a red circle that appears over the character in the battle. You can
        drag this onto the enemy you wish to deal damage to. It will be dealt at
        the start of the next turn after you let go.
      </p>

      <Button text={"Return Home"} onClick={navigateHome} />
    </div>
  );
};

export default Help;
