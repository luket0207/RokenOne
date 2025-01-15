import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import ActionPool from "./Components/ActionPool/ActionPool"; // Import ActionPool component
import Enemy from "./Components/Enemy/Enemy"; // Import Enemy component
import "./Battle.scss";
import Button from "../../Components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCross, faXmark } from "@fortawesome/free-solid-svg-icons";

const Battle = () => {
  const { playerTeam, setPlayerTeam } = useContext(GameDataContext);
  const { state } = useLocation(); // Retrieve the enemies passed from Home
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [battleEnded, setBattleEnded] = useState(false);
  const [enemies, setEnemies] = useState(state?.enemies || []); // Get enemies from the state
  const [enemyHealths, setEnemyHealths] = useState(
    enemies.map((enemy) => enemy.health)
  ); // Health of each enemy
  const navigate = useNavigate();

  const intervalRef = useRef(null); // Use ref for interval

  useEffect(() => {
    const hasTimeline = enemies.every((enemy) => enemy.timeline);

    if (!hasTimeline) {
      const updatedEnemies = enemies.map((enemy) => {
        const { actionArray, actionPatterns } = enemy;

        // Step 1: Randomly select an action pattern
        const randomPatternIndex = Math.floor(
          Math.random() * actionPatterns.length
        );
        const selectedPattern = actionPatterns[randomPatternIndex].split(",");

        // Step 2: Construct the timeline based on the selected pattern
        const timeline = selectedPattern.map((actionName) => {
          return actionArray.find(
            (action) => action.name === `Action ${actionName}`
          );
        });

        // Return the updated enemy with the timeline
        return {
          ...enemy,
          timeline, // Add the timeline to the enemy
        };
      });

      // Set the healths and update the enemies array with timelines
      setEnemyHealths(updatedEnemies.map((enemy) => enemy.health));
      setEnemies(updatedEnemies); // Update enemies with timelines
    }
  }, [enemies, setEnemies, setEnemyHealths]);

  // Cleanup the interval when the component unmounts
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Handle ending the battle
  const handleBattleEnd = () => {
    setBattleEnded(true);
    clearInterval(intervalRef.current);
  };

  // Reset battle states and navigate back to Home
  const handleCloseBattle = () => {
    setTurn(0);
    setBattleEnded(false);
    setIsBattleStarted(false);
    setPlayerTeam((prevTeam) =>
      prevTeam.map((teammate) => ({
        ...teammate,
        actionPlayed: "No Action",
        actionType: "", // Reset actionType
        currentDefence: 0, // Reset currentDefence to 0
        currentCharge: 0, // Reset currentCharge to 0
        currentIllusion: 0, // Reset currentIllusion to 0
      }))
    );
    setEnemyHealths(enemies.map((enemy) => enemy.health));
    clearInterval(intervalRef.current);
    navigate("/home");
  };

  // Start the battle and set up the turn ticking mechanism
  const handleStartBattle = () => {
    setIsBattleStarted(true);
    intervalRef.current = setInterval(() => {
      setTurn((prevTurn) => prevTurn + 1); // Only increment the turn here
    }, 1000);
  };

  useEffect(() => {
    if (turn > 0 && !battleEnded) {
      handleTurn(turn); // Process actions for the current turn
    }
  }, [turn]); // Trigger turn processing whenever turn changes

  const handleTurn = (currentTurn) => {
    // Step 1: Process player's actions first
    const updatedTeam = playerTeam.map((teammate, teammateIndex) => {
      // Skip teammates with 0 health
      if (teammate.health <= 0) return teammate;

      const actionSlotIndex = (currentTurn - 1) % teammate.timeline.length;
      const action = teammate.timeline[actionSlotIndex];

      if (!action) {
        return { ...teammate, actionPlayed: { name: "No Action", type: "" } };
      }

      // Apply team actions (attack, defense, etc.)
      if (action.defence) {
        teammate.currentDefence =
          (teammate.currentDefence || 0) + action.defence;
      }
      if (action.charge) {
        teammate.currentCharge = Math.min(
          (teammate.currentCharge || 0) + action.charge,
          10
        );
      }
      if (action.attack) {
        const totalAttack = action.attack;
        const aliveEnemiesWithIndex = enemies
          .map((enemy, index) => ({ enemy, index }))
          .filter(({ enemy, index }) => enemyHealths[index] > 0);

        if (aliveEnemiesWithIndex.length > 0) {
          const randomAliveEnemy = Math.floor(
            Math.random() * aliveEnemiesWithIndex.length
          );
          const { index: originalEnemyIndex } =
            aliveEnemiesWithIndex[randomAliveEnemy];
          applyDamageToEnemy(originalEnemyIndex, totalAttack, teammateIndex);
        }
      }

      return { ...teammate, actionPlayed: action };
    });

    setPlayerTeam(updatedTeam);

    // Step 2: Now process enemies' actions (only once per turn)
    const updatedEnemies = enemies.map((enemy, enemyIndex) => {
      // Skip enemies with 0 health
      if (enemyHealths[enemyIndex] <= 0) return enemy;

      const actionSlotIndex = (currentTurn - 1) % enemy.timeline.length;
      const action = enemy.timeline[actionSlotIndex];

      if (!action) {
        return { ...enemy, actionPlayed: { name: "No Action", type: "" } };
      }

      // Apply enemy actions (for example, attacking the player's team)
      if (action.attack) {
        const totalAttack = action.attack;
        const aliveTeammatesWithIndex = playerTeam
          .map((teammate, index) => ({ teammate, index }))
          .filter(({ teammate }) => teammate.health > 0);

        if (aliveTeammatesWithIndex.length > 0) {
          const randomAliveTeammate = Math.floor(
            Math.random() * aliveTeammatesWithIndex.length
          );
          const { index: teammateIndex } =
            aliveTeammatesWithIndex[randomAliveTeammate];
          applyDamageToTeammate(teammateIndex, totalAttack, enemyIndex);
        }
      }

      return { ...enemy, actionPlayed: action };
    });

    setEnemies(updatedEnemies); // Update the enemies state with new actions
  };

  // Apply damage to a specific teammate
  const applyDamageToTeammate = (teammateIndex, attackValue, enemyIndex) => {
    console.log("first trigger");
    const turnCheck = 0;
    setPlayerTeam((prevTeam) => {
      const updatedTeam = [...prevTeam];
      const teammate = updatedTeam[teammateIndex];
      console.log("second trigger");

      let remainingDamage = attackValue;

      // First reduce defense
      if (teammate.currentDefence > 0) {
        if (teammate.currentDefence >= remainingDamage) {
          // If defense is greater than or equal to the damage, just reduce the defense
          teammate.currentDefence -= remainingDamage;
          remainingDamage = 0; // No remaining damage
        } else {
          // If defense is less than the damage, reduce the defense to 0
          remainingDamage -= teammate.currentDefence;
          teammate.currentDefence = 0;
        }
      }

      // Apply remaining damage to health if any
      if (remainingDamage > 0) {
        teammate.health = Math.max(0, teammate.health - remainingDamage);
      }

      console.log(
        `On Turn ${turn}, enemy ${enemies[enemyIndex].name} dealt ${attackValue} damage to ${playerTeam[teammateIndex].name}, remaining damage: ${remainingDamage}`
      );

      // Check if all teammates are defeated
      if (updatedTeam.every((teammate) => teammate.health <= 0)) {
        handleBattleEnd();
      }

      return updatedTeam; // Return the updated team in a single state update
    });
  };

  // Apply damage to a specific enemy, ensuring only one teammate attacks per turn
  const applyDamageToEnemy = (enemyIndex, attackValue, teammateIndex) => {
    setEnemyHealths((prevHealths) => {
      const updatedHealths = [...prevHealths];
      const enemy = enemies[enemyIndex];

      let remainingDamage = attackValue;

      // First reduce defense
      if (enemy.currentDefence > 0) {
        if (enemy.currentDefence >= remainingDamage) {
          // If defense is greater than or equal to the damage, just reduce the defense
          enemy.currentDefence -= remainingDamage;
          remainingDamage = 0; // No remaining damage
        } else {
          // If defense is less than the damage, reduce the defense to 0
          remainingDamage -= enemy.currentDefence;
          enemy.currentDefence = 0;
        }
      }

      // Apply remaining damage to health if any
      if (remainingDamage > 0) {
        updatedHealths[enemyIndex] = Math.max(
          0,
          updatedHealths[enemyIndex] - remainingDamage
        );
      }

      console.log(
        `On turn ${turn}, ${attackValue} damage was dealt to ${enemies[enemyIndex].name} by teammate ${playerTeam[teammateIndex].name}, remaining damage: ${remainingDamage}`
      );

      // Check if all enemies are defeated
      if (updatedHealths.every((health) => health <= 0)) {
        handleBattleEnd();
      }

      return updatedHealths;
    });
  };

  return (
    <div className="battle-container">
      <button className="close-battle" onClick={handleCloseBattle}>
        <FontAwesomeIcon icon={faXmark} />
      </button>

      {!isBattleStarted && (
        <div className="start-container">
          <div className="start-modal">
            <Button text={"Start Battle"} onClick={handleStartBattle}></Button>
          </div>
        </div>
      )}
      <div className="battle-info">
        {battleEnded && (
          <div className="battle-ended">
            <p>All Enemies Defeated!</p>
            <button onClick={handleCloseBattle}>Back to Home</button>
          </div>
        )}

        {!battleEnded && (
          <div className="turn-info">
            <p>Turn: {turn}</p>
          </div>
        )}
      </div>

      {/* Render Enemy Component */}
      <Enemy
        enemies={enemies}
        enemyHealths={enemyHealths}
        enemyActions={enemies.map((enemy, enemyIndex) => enemy.actionPlayed)}
      />

      {/* Render ActionPool Component */}
      <ActionPool playerTeam={playerTeam} turn={turn} />
    </div>
  );
};

export default Battle;
