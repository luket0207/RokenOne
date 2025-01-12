import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import actions from "../../Data/Actions/Actions"; // Import the actions JSON file
import "./Battle.scss";

const Battle = () => {
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [battleEnded, setBattleEnded] = useState(false);
  const [enemyHealth, setEnemyHealth] = useState(30); // Enemy's health starts at 30
  const navigate = useNavigate();

  const turnRef = useRef(turn); // Store the turn in a ref to track its latest value
  const intervalRef = useRef(null); // Store the interval ID to clear it later

  // Update the ref whenever turn changes
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  // Handle the battle end when the enemy's health reaches 0
  const handleBattleEnd = () => {
    setBattleEnded(true); // Mark the battle as ended
    clearInterval(intervalRef.current); // Stop the tick when battle ends
  };

  // Close the battle and reset all states
  const handleCloseBattle = () => {
    setTurn(0); // Reset the turn counter
    setBattleEnded(false); // Mark the battle as not ended
    setIsBattleStarted(false); // Set the battle as not started
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => ({
        ...teammate,
        actionPlayed: "No Action", // Reset action played for each teammate
      }))
    );
    setEnemyHealth(30); // Reset the enemy health
    clearInterval(intervalRef.current); // Stop the tick when the battle is closed
    navigate("/home"); // Navigate back to home
  };

  // Start battle and initialize timer
  const handleStartBattle = () => {
    setIsBattleStarted(true);
    // Set up an interval to call handleTurn every second
    intervalRef.current = setInterval(() => {
      handleTurn(); // Perform the action updates every tick
      console.log("Ticked on turn " + turnRef.current);

      // Increment the turn count after actions are applied
      setTurn((prevTurn) => {
        console.log("Prev turn: " + prevTurn); // Check if prevTurn is correct
        return prevTurn + 1;
      }); // This ensures the turn state is updated correctly
    }, 1000); // 1 second interval
  };

  const handleTurn = () => {
    console.log("Handling turn " + turnRef.current);

    // Perform the actions for the current turn
    const updatedTeam = playerTeam.map((teammate) => {
      const actionSlotIndex = turnRef.current % teammate.timeline.length;
      const action = teammate.timeline[actionSlotIndex];

      if (action && (action.attack || action.attackAll)) {
        const totalAttack = action.attack || action.attackAll;
        applyDamageToEnemy(totalAttack); // Apply attack damage to the enemy
      }

      return {
        ...teammate,
        actionPlayed: action ? action.name : "No Action",
      };
    });

    setPlayerTeam(updatedTeam); // Update the team with the new actions
  };

  const applyDamageToEnemy = (attackValue) => {
    setEnemyHealth((prevHealth) => {
      const newHealth = prevHealth - attackValue;
      if (newHealth <= 0) {
        handleBattleEnd(); // End the battle if health reaches 0
      }
      return newHealth > 0 ? newHealth : 0;
    });
  };

  return (
    <div className="battle-container">
      {/* Close Battle Button */}
      <button className="close-battle" onClick={handleCloseBattle}>
        X
      </button>

      {/* Start Battle Button */}
      {!isBattleStarted && (
        <button className="start-battle" onClick={handleStartBattle}>
          Start Battle
        </button>
      )}

      {/* Battle End Message */}
      {battleEnded && (
        <div className="battle-ended">
          <p>Enemy defeated!</p>
          <button onClick={handleCloseBattle}>Back to Home</button>
        </div>
      )}

      {/* Turn Display */}
      {!battleEnded && (
        <div className="turn-info">
          <p>Turn: {turn + 1}</p>
        </div>
      )}

      {/* Enemy Health Display */}
      <div className="enemy-health">
        <h2>Enemy</h2>
        <div className="health-bar">
          <div
            className="health-bar-inner"
            style={{ width: `${(enemyHealth / 30) * 100}%` }}
          ></div>
        </div>
        <p>Health: {enemyHealth}</p>
      </div>

      {/* Battle Pod for Each Teammate */}
      <div className="battle-pods">
        {playerTeam.map((teammate) => (
          <div key={teammate.id} className="battle-pod">
            <h2>{teammate.name}</h2>
            <p>Health: {teammate.health}</p>
            <p>Action Played: {teammate.actionPlayed}</p>{" "}
            {/* Display the action name directly */}
            {/* Display all actions in the timeline */}
            <div className="timeline">
              {teammate.timeline.map((action, index) => {
                const isCurrentAction =
                  index === turnRef.current % teammate.timeline.length;
                return (
                  <div
                    key={index}
                    className={`timeline-action ${
                      isCurrentAction ? "highlighted" : ""
                    }`}
                  >
                    {action ? action.name : "No Action"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battle;
