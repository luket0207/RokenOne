import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import Team from "./Components/Team/Team"; // Import Team component
import Enemy from "./Components/Enemy/Enemy"; // Import Enemy component
import "./Battle.scss";
import Button from "../../Components/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ChargeBar from "./Components/ChargeBar/ChargeBar";
import ManaIcon from "../../Components/ManaIcon/ManaIcon";
import {
  triggerWeapon,
  playerTeamWithWeapons,
} from "../../Utils/Battle/WeaponUtils";

const Battle = () => {
  const {
    playerTeam,
    setPlayerTeam,
    playerData,
    setPlayerData,
    resetExpedition,
    moveToNextDay,
  } = useContext(GameDataContext);
  const { state } = useLocation(); // Retrieve the enemies passed from Home
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [battleEnded, setBattleEnded] = useState(false);
  const [win, setWin] = useState(false);
  const [enemies, setEnemies] = useState(state?.enemies || []); // Get enemies from the state
  const [weaponPlayed, setWeaponPlayed] = useState(null);
  const [weaponAttacker, setWeaponAttacker] = useState(null);
  const [weaponEnemy, setWeaponEnemy] = useState(null);
  const [currentWeaponIndex, setCurrentWeaponIndex] = useState(0);
  const [weaponAnimation, setWeaponAnimation] = useState(null);
  const navigate = useNavigate();
  const [teamCharge, setTeamCharge] = useState(0);
  const [enemyCharge, setEnemyCharge] = useState(0);
  const [mana, setMana] = useState(null);
  const [opponentTarget, setOpponentTarget] = useState(null);
  const intervalRef = useRef(null); // Use ref for interval
  const [intervalTime, setIntervalTime] = useState(1000);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(state?.difficulty || 0);
  const availableMana = [
    "black",
    "grey",
    "orange",
    "teal",
    "gold",
    "jade",
    "crimson",
    "emerald",
  ];

  const [teamWeapons, setTeamWeapons] = useState(
    playerTeamWithWeapons(playerTeam)
  );

  useEffect(() => {
    if (isBattleStarted && !battleEnded && !paused) {
      // Check if not paused
      clearInterval(intervalRef.current); // Clear previous interval
      intervalRef.current = setInterval(() => {
        setTurn((prevTurn) => prevTurn + 1); // Increment turn
      }, intervalTime);
    }

    // Cleanup the interval when the component unmounts or battle ends or pauses
    return () => clearInterval(intervalRef.current);
  }, [intervalTime, isBattleStarted, battleEnded, paused]); // Add paused to the dependencies

  const handleSlowSpeed = () => setIntervalTime(2000); // 2 seconds interval
  const handleNormalSpeed = () => setIntervalTime(1000); // 1 second interval
  const handleFastSpeed = () => setIntervalTime(500); // 0.5 second interval

  const handlePause = () => {
    setPaused((prevPaused) => !prevPaused); // Toggle paused state
  };

  useEffect(() => {
    const hasTimeline = enemies.every((enemy) => enemy.timeline);

    if (!hasTimeline) {
      const updatedEnemies = enemies.map((enemy) => {
        const { actionArray, actionPatterns, health, maxHealth } = enemy;

        // Step 1: Randomly select an action pattern
        const randomPatternIndex = Math.floor(
          Math.random() * actionPatterns.length
        );
        const selectedPattern = actionPatterns[randomPatternIndex].split(",");

        // Step 3: Apply difficulty scaling to actionArray attributes
        const scaledActionArray = actionArray.map((action, index) => {
          // List of all the attributes that need scaling
          const attributesToScale = [
            "attack",
            "defence",
            "heal",
            "attackAll",
            "defenceAll",
            "healAll",
            "buffAttack",
            "buffDefence",
            "buffHeal",
            "attackWeaponBoost",
          ];

          // Scale the main attributes only if they are present and greater than 0
          const scaledAction = attributesToScale.reduce(
            (acc, attr) => {
              if (action[attr] !== undefined && action[attr] > 0) {
                // Only scale if the attribute is present and its value is greater than 0
                acc[attr] = action[attr] + difficulty * 10;
              } else {
                acc[attr] = action[attr]; // Keep the original value if scaling isn't applied
              }
              return acc;
            },
            { ...action }
          );

          // Function to scale cycleBoostEffect and manaBoostEffect
          const scaleBoostEffect = (effectArray) => {
            return effectArray.map(([attr, operation, value]) => {
              if (attributesToScale.includes(attr) && operation === "plus") {
                return [attr, operation, value + difficulty * 10];
              }
              return [attr, operation, value];
            });
          };

          // Scale cycleBoostEffect and manaBoostEffect
          if (action.cycleBoostEffect) {
            scaledAction.cycleBoostEffect = scaleBoostEffect(
              action.cycleBoostEffect
            );
          }
          if (action.manaBoostEffect) {
            scaledAction.manaBoostEffect = scaleBoostEffect(
              action.manaBoostEffect
            );
          }

          return scaledAction;
        });

        // Step 2: Construct the timeline based on the selected pattern
        const timeline = selectedPattern.map((actionName) => {
          // Find the corresponding action in the actionArray
          const action = scaledActionArray.find(
            (action) => action.action === `Action ${actionName}`
          );

          if (action && action.type === "null") {
            return null; // Handle empty slots as null or skip them
          }

          return action; // Return the action as is
        });

        // Step 4: Apply difficulty scaling to health and maxHealth
        const scaledHealth = health > 0 ? health + difficulty * 10 : health;
        const scaledMaxHealth =
          maxHealth > 0 ? maxHealth + difficulty * 10 : maxHealth;

        // Return the updated enemy with the timeline, scaled actionArray, and health values
        return {
          ...enemy,
          actionArray: scaledActionArray, // Apply the scaled actionArray
          timeline, // Add the timeline to the enemy
          health: scaledHealth, // Apply the scaled health
          maxHealth: scaledMaxHealth, // Apply the scaled maxHealth
        };
      });

      setEnemies(updatedEnemies); // Update enemies with timelines, difficulty scaling, and health updates
    }
  }, [enemies, setEnemies, difficulty]);

  // Cleanup the interval when the component unmounts
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Handle ending the battle
  const handleBattleEnd = (win) => {
    setWin(win);
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
    clearInterval(intervalRef.current);
    moveToNextDay();
    navigate("/expeditionhome");
  };

  //Return the player to home because they fainted and clear the expedition
  const handleFainted = () => {
    resetExpedition();
    navigate("/home");
  };

  const handleStartBattle = () => {
    setIsBattleStarted(true);

    // Reset cycle for all characters in playerTeam and enemies
    setPlayerTeam((prevPlayerTeam) => {
      return prevPlayerTeam.map((teammate) => ({
        ...teammate,
        cycle: 0, // Reset cycle to 0 for each teammate
        weapon: teammate.weapon
          ? teammate.weapon.map((weapon) => ({
              ...weapon,
              cycle: 0, // Reset the weapon cycle to 0 if weapon exists
            }))
          : [], // If no weapon exists, return an empty array
      }));
    });

    setEnemies((prevEnemies) => {
      return prevEnemies.map((enemy) => ({
        ...enemy,
        cycle: 0, // Reset cycle to 0 for each enemy
        weapon: enemy.weapon
          ? enemy.weapon.map((weapon) => ({
              ...weapon,
              cycle: 0, // Reset the weapon cycle to 0 if weapon exists
            }))
          : [], // If no weapon exists, return an empty array
      }));
    });

    console.log(
      "****************************//////////////////////////// NEW BATTLE STARTED ////////////////////////////****************************"
    );

    intervalRef.current = setInterval(() => {
      setTurn((prevTurn) => prevTurn + 1); // Only increment the turn here
    }, 1000);
  };

  useEffect(() => {
    if (turn > 0 && !battleEnded) {
      // Check if the targeted enemy is alive
      const targetedEnemy = enemies[opponentTarget];
      if (targetedEnemy && targetedEnemy.health === 0) {
        // If the enemy is dead, reset the opponent target
        setOpponentTarget(null);
      }

      const turnMana = generateMana(availableMana);

      // Pass in the appropriate team, setTeam function, and whether it's the player team
      setMana(turnMana);
      setWeaponAnimation(null);
      handleTurn(
        playerTeam,
        setPlayerTeam,
        enemies,
        setEnemies,
        turnMana,
        weaponAttacker,
        weaponEnemy,
        opponentTarget
      );
    }
  }, [turn]);

  const manaList = [
    { colour: "black", type: "dark", rarity: "common", baseProbability: 0.7 },
    { colour: "grey", type: "light", rarity: "common", baseProbability: 0.7 },
    {
      colour: "orange",
      type: "dark",
      rarity: "uncommon",
      baseProbability: 0.4,
    },
    { colour: "teal", type: "light", rarity: "uncommon", baseProbability: 0.4 },
    { colour: "gold", type: "dark", rarity: "rare", baseProbability: 0.2 },
    { colour: "jade", type: "light", rarity: "rare", baseProbability: 0.2 },
    {
      colour: "crimson",
      type: "dark",
      rarity: "veryRare",
      baseProbability: 0.05,
    },
    {
      colour: "emerald",
      type: "light",
      rarity: "veryRare",
      baseProbability: 0.05,
    },
  ];

  // Function to generate mana
  const generateMana = (availableMana) => {
    if (stickMana(mana)) {
      // Filter available mana from the mana list
      const filteredMana = manaList.filter((mana) =>
        availableMana.includes(mana.colour)
      );

      // Group the filtered mana by their rarities
      const rarityGroups = {
        common: filteredMana.filter((mana) => mana.rarity === "common"),
        uncommon: filteredMana.filter((mana) => mana.rarity === "uncommon"),
        rare: filteredMana.filter((mana) => mana.rarity === "rare"),
        veryRare: filteredMana.filter((mana) => mana.rarity === "veryRare"),
      };

      // Adjust probabilities based on what's available
      const rarityWeights = {
        common: rarityGroups.common.length > 0 ? 0.5 : 0,
        uncommon: rarityGroups.uncommon.length > 0 ? 0.3 : 0,
        rare: rarityGroups.rare.length > 0 ? 0.15 : 0,
        veryRare: rarityGroups.veryRare.length > 0 ? 0.05 : 0,
      };

      // Calculate total available probability
      const totalWeight = Object.values(rarityWeights).reduce(
        (sum, weight) => sum + weight,
        0
      );

      // Normalize the weights for available rarities
      Object.keys(rarityWeights).forEach((rarity) => {
        rarityWeights[rarity] = rarityWeights[rarity] / totalWeight;
      });

      // Assign adjusted probabilities to each available mana
      const manaProbabilities = filteredMana.map((mana) => {
        const rarityProbability = rarityWeights[mana.rarity];
        const groupSize = rarityGroups[mana.rarity].length;
        return {
          ...mana,
          adjustedProbability: rarityProbability / groupSize,
        };
      });

      // Randomly choose a mana based on probabilities
      const randomValue = Math.random();
      let cumulativeProbability = 0;

      for (const mana of manaProbabilities) {
        cumulativeProbability += mana.adjustedProbability;
        if (randomValue <= cumulativeProbability) {
          return mana.colour;
        }
      }
    } else {
      return mana;
    }
  };

  const stickMana = (mana) => {
    // Define the stick chances based on the mana type

    const stickChanceByMana = {
      black: 0.5,
      grey: 0.5,
      orange: 0.5,
      teal: 0.5,
      gold: 0.4,
      jade: 0.4,
      crimson: 0.4,
      emerald: 0.4,
    };

    // Check if the mana type exists in the stickChanceByMana
    const stickChance = stickChanceByMana[mana];

    // If the mana type is not recognized, assume it should change (true)
    if (stickChance === undefined) {
      return true;
    }

    // Generate a random number to see if the mana should change
    const randomValue = Math.random(); // Generates a number between 0 and 1

    // Return false if the mana should stick (not change), true otherwise
    return randomValue >= stickChance;
  };

  const checkManaBoost = (mana, manaBoost, manaBoostEffect, action) => {
    // Define mana types
    const manaTypes = {
      dark: ["black", "orange", "gold", "crimson"],
      light: ["grey", "teal", "jade", "emerald"],
    };

    // Determine mana type
    const manaType = Object.keys(manaTypes).find((type) =>
      manaTypes[type].includes(mana)
    );

    // If the mana matches either the manaBoost or the manaType
    if (mana === manaBoost || manaType === manaBoost) {
      // Apply the mana boost effect to the action attributes
      if (Array.isArray(manaBoostEffect)) {
        manaBoostEffect.forEach(([attribute, operation, boostValue]) => {
          if (action.originalValues === undefined) {
            action.originalValues = {}; // Initialize if not present
          }

          // Determine the original value of the attribute, default to 0 if it doesn't exist
          const originalValue =
            action[attribute] !== undefined ? action[attribute] : 0;

          // Handle different operations
          switch (operation) {
            case "plus":
              action.originalValues[attribute] = originalValue;
              action[attribute] = originalValue + boostValue;
              break;

            case "minus":
              action.originalValues[attribute] = originalValue;
              action[attribute] = originalValue - boostValue;
              break;

            case "times":
              action.originalValues[attribute] = originalValue;
              action[attribute] = Math.ceil(originalValue * boostValue);
              break;

            case "divide":
              action.originalValues[attribute] = originalValue;
              action[attribute] = Math.ceil(originalValue / boostValue);
              break;

            case "equals":
              // If boostValue is a string, fetch the value from the corresponding attribute
              const targetValue =
                typeof boostValue === "string"
                  ? action[boostValue] || 0
                  : boostValue;
              action.originalValues[attribute] = originalValue;
              action[attribute] = targetValue;
              break;

            default:
              console.error(`Unknown operation: ${operation}`);
          }

          // Log the operation result
          console.log(
            `${attribute} was updated using operation ${operation} with boostValue ${boostValue}, new value: ${action[attribute]}`
          );
        });
      } else {
        console.error(
          "manaBoostEffect is not an iterable array:",
          manaBoostEffect
        );
      }
    }
    return action;
  };

  const checkCycleBoost = (teammate, cycleBoost, cycleBoostEffect, action) => {
    if (cycleBoost && cycleBoostEffect && Array.isArray(cycleBoostEffect)) {
      const cycle = teammate.cycle || 0; // Default cycle to 0 if not present

      // Check if the cycleBoost effect should be applied
      if (
        (cycleBoost === 1 && cycle === 0) || // Apply if cycleBoost is 1 and cycle is 0
        (cycleBoost > 1 && cycle % cycleBoost === cycleBoost - 1) // Apply every Nth cycle (cycleBoost-1 mod logic)
      ) {
        // Apply the cycle boost effect to the action attributes
        cycleBoostEffect.forEach(([attribute, operation, boostValue]) => {
          if (action.originalValues === undefined) {
            action.originalValues = {}; // Initialize if not present
          }

          // Determine the original value of the attribute, default to 0 if it doesn't exist
          const originalValue =
            action[attribute] !== undefined ? action[attribute] : 0;

          // Handle different operations (same as manaBoostEffect)
          switch (operation) {
            case "plus":
              action.originalValues[attribute] = originalValue;
              action[attribute] = originalValue + boostValue;
              break;

            case "minus":
              action.originalValues[attribute] = originalValue;
              action[attribute] = originalValue - boostValue;
              break;

            case "times":
              action.originalValues[attribute] = originalValue;
              action[attribute] = Math.ceil(originalValue * boostValue);
              break;

            case "divide":
              action.originalValues[attribute] = originalValue;
              action[attribute] = Math.ceil(originalValue / boostValue);
              break;

            case "equals":
              // If boostValue is a string, fetch the value from the corresponding attribute
              const targetValue =
                typeof boostValue === "string"
                  ? action[boostValue] || 0
                  : boostValue;
              action.originalValues[attribute] = originalValue;
              action[attribute] = targetValue;
              break;

            default:
              console.error(`Unknown operation: ${operation}`);
          }

          // Log the operation result
          console.log(
            `Cycle Boost applied: ${attribute} was updated using operation ${operation} with boostValue ${boostValue}, new value: ${action[attribute]}`
          );
        });
      }
    }
    return action;
  };

  // Function to perform illusion checks and replace actions with 'Missed' if applicable
  const performIllusionCheck = (team) => {
    return team.map((teammate) => {
      if (teammate.health > 0 && teammate.currentIllusion > 0) {
        const action = teammate.actionPlayed;
        if (action && action.type !== "Illusion") {
          const chanceToMiss = teammate.currentIllusion * 25; // 25% per illusion level
          const roll = Math.random() * 100;
          if (roll < chanceToMiss) {
            console.log(
              `${teammate.name} missed their action due to illusion! (Illusion level: ${teammate.currentIllusion}, Roll: ${roll})`
            );
            // Replace action with "Missed" action
            teammate.actionPlayed = {
              id: "M155",
              class: "All",
              name: "Missed",
              type: "missed",
            };
          }
        }
      }
      return teammate;
    });
  };
  const handleTurn = (
    playerTeam,
    setPlayerTeam,
    enemies,
    setEnemies,
    turnMana,
    weaponAttacker,
    weaponEnemy,
    opponentTargetIndex = null
  ) => {
    let playerTeamBuffs = { attack: 0, defence: 0, heal: 0 };
    let enemyTeamBuffs = { attack: 0, defence: 0, heal: 0 };

    console.log(`!!!NEW TURN!!! turn: ${turn} mana: ${turnMana}`);

    // Step 2: Apply illusion effects to both teams before any action processing
    const applyIllusionEffects = (team, enemyTeam) => {
      team.forEach((teammate) => {
        if (teammate.health <= 0) return; // Skip dead teammates

        let action = teammate.timeline[(turn - 1) % teammate.timeline.length];
        if (!action) return;

        // Apply illusion effects
        if (action.illusion || action.illusionAll) {
          if (action.illusion) {
            let aliveEnemies = enemyTeam.filter((enemy) => enemy.health > 0);
            if (aliveEnemies.length > 0) {
              let randomIndex = Math.floor(Math.random() * aliveEnemies.length);
              let target = aliveEnemies[randomIndex];
              target.currentIllusion = Math.min(
                target.currentIllusion + action.illusion,
                4
              );
              console.log(
                `${teammate.name} applied ${target.currentIllusion} illusion to ${target.name}`
              );
            }
          }
          if (action.illusionAll) {
            enemyTeam.forEach((enemy) => {
              if (enemy.health > 0) {
                enemy.currentIllusion = Math.min(
                  enemy.currentIllusion + action.illusionAll,
                  3
                );
                console.log(
                  `${teammate.name} applied ${action.illusionAll} illusion to ${enemy.name}`
                );
              }
            });
          }
        }
      });
    };

    // Apply illusion to both teams
    applyIllusionEffects(playerTeam, enemies);
    applyIllusionEffects(enemies, playerTeam);

    // Step 3: Process each team's actions for the current turn
    const processActionsForTurn = (team, isPlayerTeam) => {
      return team.map((teammate) => {
        if (teammate.health <= 0) {
          teammate.actionPlayed = null;
          return null;
        }

        let actionIndex = (turn - 1) % teammate.timeline.length;
        let action = teammate.timeline[actionIndex];

        if (!action) {
          teammate.actionPlayed = null;
          return null;
        }

        // Handle cycle tracking and increment
        if (actionIndex === 0 && turn > 1) {
          teammate.cycle = (teammate.cycle || 0) + 1;
          console.log(
            `${teammate.name} has completed a cycle. Cycle count: ${teammate.cycle}`
          );
        }

        // Store the action to be played
        teammate.actionPlayed = action;

        // Apply mana boost and any other adjustments
        if (action.manaBoost) {
          action = checkManaBoost(
            turnMana,
            action.manaBoost,
            action.manaBoostEffect,
            action
          );
        }

        // Apply cycle boost
        if (action.cycleBoost) {
          action = checkCycleBoost(
            teammate,
            action.cycleBoost,
            action.cycleBoostEffect,
            action
          );
        }

        // Handle chargeCost: Reduce team charge if the action has a chargeCost
        if (action.chargeCost) {
          const currentCharge = isPlayerTeam ? teamCharge : enemyCharge;

          // Ensure there is enough charge
          if (currentCharge >= action.chargeCost) {
            isPlayerTeam
              ? setTeamCharge(currentCharge - action.chargeCost)
              : setEnemyCharge(currentCharge - action.chargeCost);
            console.log(
              `${teammate.name} used ${action.chargeCost} charge for action ${
                action.id
              }. Remaining charge: ${
                isPlayerTeam
                  ? teamCharge - action.chargeCost
                  : enemyCharge - action.chargeCost
              }`
            );
          } else {
            console.log(
              `${teammate.name} does not have enough charge to use action ${action.id}.`
            );

            // If no charge, change the action to "missed"
            action = {
              id: "M155",
              class: "All",
              name: "No Charge",
              type: "missed",
            };
            teammate.actionPlayed = action; // Update teammate's action with the "missed" one
            return action; // Return the modified action
          }
        }

        return action;
      });
    };

    const playerActions = processActionsForTurn(playerTeam, true);
    const enemyActions = processActionsForTurn(enemies, false);

    // Step 4: Perform illusion check for both teams
    const updatedPlayerTeam = performIllusionCheck(playerTeam);
    const updatedEnemyTeam = performIllusionCheck(enemies);

    // Step 5: Calculate buffs for both teams
    calcBuffs(updatedPlayerTeam, playerTeamBuffs);
    calcBuffs(updatedEnemyTeam, enemyTeamBuffs);

    // Step 6: Calculate defence and defenceAll for both teams
    const playerTeamWithDefence = calcDefence(
      updatedPlayerTeam,
      playerTeamBuffs.defence
    );
    const enemyTeamWithDefence = calcDefence(
      updatedEnemyTeam,
      enemyTeamBuffs.defence
    );

    // Step 7: Process charge actions for both teams
    const playerTeamWithCharge = calcCharge(playerTeamWithDefence, true);
    const enemyTeamWithCharge = calcCharge(enemyTeamWithDefence, false);

    // Step 8: Process attack actions for both teams
    const playerTeamWithAttack = calcAttack(
      playerTeamWithCharge,
      playerTeamBuffs.attack,
      true,
      opponentTargetIndex
    );
    const enemyTeamWithAttack = calcAttack(
      enemyTeamWithCharge,
      enemyTeamBuffs.attack,
      false,
      null
    );

    // Step 9: Process healing actions for both teams
    const playerTeamWithHeal = calcHeal(
      playerTeamWithAttack,
      playerTeamBuffs.heal
    );
    const enemyTeamWithHeal = calcHeal(
      enemyTeamWithAttack,
      enemyTeamBuffs.heal
    );

    // Trigger weapon if played
    let finalPlayerTeam = playerTeamWithHeal;
    let finalEnemyTeam = enemyTeamWithHeal;

    if (playerData[0].autoWeaponStatus !== "off") {
      if (finalPlayerTeam && finalPlayerTeam.length > 0) {
        setWeaponAnimation("");
        const attackedEnemy = autoTriggerWeapon({
          teamWeapons: teamWeapons,
          playerTeam: finalPlayerTeam,
          enemyTeam: finalEnemyTeam,
          teamCharge: teamCharge,
          triggerWeapon: triggerWeapon,
          currentWeaponIndex: currentWeaponIndex,
          setCurrentWeaponIndex: setCurrentWeaponIndex,
          autoWeaponStatus: playerData[0].autoWeaponStatus,
        });
        setWeaponAnimation(attackedEnemy);
      }
      finalPlayerTeam = updatedPlayerTeam;
      finalEnemyTeam = updatedEnemyTeam;
    } else if (weaponAttacker !== null && weaponEnemy !== null) {
      const { updatedPlayerTeam, updatedEnemyTeam } = triggerWeapon({
        weaponAttacker: weaponAttacker,
        weaponEnemy: weaponEnemy,
        playerTeam: finalPlayerTeam,
        setPlayerTeam: setPlayerTeam,
        enemyTeam: finalEnemyTeam,
        setWeaponPlayed: setWeaponPlayed,
        applyDamage: applyDamage,
        teamCharge: teamCharge,
        setTeamCharge: setTeamCharge,
      });
      setWeaponAnimation(weaponEnemy);
      finalPlayerTeam = updatedPlayerTeam;
      finalEnemyTeam = updatedEnemyTeam;
    }

    // Step 10: Remove mana boost effects and reset illusions
    const resetEffectsAndIllusions = (team) => {
      return team.map((teammate) => {
        const { actionPlayed } = teammate;
        if (actionPlayed && actionPlayed.originalValues) {
          const { originalValues } = actionPlayed;
          Object.keys(originalValues).forEach((attribute) => {
            if (originalValues[attribute] === undefined) {
              delete actionPlayed[attribute]; // Remove newly created attribute
            } else {
              actionPlayed[attribute] = originalValues[attribute]; // Restore original value
            }
          });
          delete actionPlayed.originalValues;
        }
        teammate.currentIllusion = 0; // Reset illusion
        return teammate;
      });
    };

    // Reset effects and update both teams' state
    const finalProcessedPlayerTeam = resetEffectsAndIllusions(finalPlayerTeam);
    const finalProcessedEnemyTeam = resetEffectsAndIllusions(finalEnemyTeam);

    setPlayerTeam(finalProcessedPlayerTeam);
    setEnemies(finalProcessedEnemyTeam);

    // Reset weapon-related variables
    setWeaponAttacker(null);
    setWeaponEnemy(null);
    setWeaponPlayed(null);
  };

  const calcBuffs = (team, teamBuffs) => {
    team.forEach((teammate) => {
      if (teammate.health <= 0) return; // Skip dead teammates

      const action = teammate.actionPlayed; // Use action played for this turn
      if (action) {
        if (action.buffAttack) {
          teamBuffs.attack += action.buffAttack;
          console.log(
            `Buffed team attack by ${action.buffAttack} from ${teammate.name}`
          );
        }
        if (action.buffDefence) {
          teamBuffs.defence += action.buffDefence;
          console.log(
            `Buffed team defense by ${action.buffDefence} from ${teammate.name}`
          );
        }
        if (action.buffHeal) {
          teamBuffs.heal += action.buffHeal;
          console.log(
            `Buffed team heal by ${action.buffHeal} from ${teammate.name}`
          );
        }
      }
    });
  };

  // Defence calculation function
  const calcDefence = (team, teamDefenceBuffThisTurn) => {
    return team.map((teammate) => {
      if (teammate.health <= 0) return teammate; // Skip dead teammates

      const action = teammate.actionPlayed; // Use action played for this turn
      if (action && action.defence) {
        const turnDefence = action.defence + teamDefenceBuffThisTurn;
        teammate.currentDefence = Math.min(
          teammate.maxHealth,
          (teammate.currentDefence || 0) + turnDefence
        );
        console.log(
          `On turn ${turn}, ${teammate.name} defended with ${turnDefence}, defence capped at ${teammate.maxHealth}`
        );
      }

      if (action && action.defenceAll) {
        const turnDefenceAll = action.defenceAll + teamDefenceBuffThisTurn;
        team.forEach((member) => {
          if (member.health > 0) {
            member.currentDefence = Math.min(
              member.maxHealth,
              (member.currentDefence || 0) + turnDefenceAll
            );
          }
        });
        console.log(
          `On turn ${turn}, all teammates received ${turnDefenceAll} defence, defence capped at maxHealth`
        );
      }

      return teammate;
    });
  };

  // Charge calculation function
  const calcCharge = (team, isPlayerTeam) => {
    return team.map((teammate) => {
      if (teammate.health <= 0) return teammate; // Skip dead teammates

      const action = teammate.actionPlayed; // Use action played for this turn
      if (action && action.charge) {
        if (isPlayerTeam) {
          setTeamCharge((prevCharge) =>
            Math.min(prevCharge + action.charge, 10)
          );
        } else {
          setEnemyCharge((prevCharge) =>
            Math.min(prevCharge + action.charge, 10)
          );
        }
        console.log(
          `On turn ${turn}, ${teammate.name} charged by ${action.charge}`
        );
      }
      return teammate;
    });
  };

  const calcAttack = (
    team,
    teamAttackBuffThisTurn,
    isPlayerTeam,
    opponentTargetIndex
  ) => {
    return team.map((teammate, teammateIndex) => {
      if (teammate.health <= 0) return teammate; // Skip dead teammates

      const action = teammate.actionPlayed; // Use action played for this turn
      if (action) {
        // Check for attackAll first
        if (action.attackAll) {
          const totalAttackAll = action.attackAll + teamAttackBuffThisTurn;

          if (isPlayerTeam) {
            // Apply damage to all enemies
            enemies.forEach((enemy, enemyIndex) => {
              if (enemy.health > 0) {
                let finalDamage = totalAttackAll;

                // Apply battleFatigue modifier if applicable
                if (enemy.battleFatigue !== null) {
                  if (turn > enemy.battleFatigue) {
                    finalDamage *= turn - enemy.battleFatigue + 2; // Apply scaling modifier if turn > battleFatigue
                  } else if (
                    turn >
                    enemy.battleFatigue / 2 + enemy.battleFatigue / 4
                  ) {
                    finalDamage *= 4;
                  } else if (turn > enemy.battleFatigue / 2) {
                    finalDamage *= 2; // Double the damage if turn > battleFatigue / 2
                  }
                }

                applyDamage(enemyIndex, finalDamage, true, teammateIndex); // Damage to all enemies
              }
            });
          } else {
            // Apply damage to all teammates
            playerTeam.forEach((member, memberIndex) => {
              if (member.health > 0) {
                let finalDamage = totalAttackAll;

                // Apply battleFatigue modifier if applicable
                if (member.battleFatigue !== null) {
                  if (turn > member.battleFatigue) {
                    finalDamage *= turn - member.battleFatigue + 3; // Apply scaling modifier if turn > battleFatigue
                  } else if (
                    turn >
                    member.battleFatigue / 2 + member.battleFatigue / 4
                  ) {
                    finalDamage *= 4;
                  } else if (turn > member.battleFatigue / 2) {
                    finalDamage *= 2; // Double the damage if turn > battleFatigue / 2
                  }
                }

                applyDamage(memberIndex, finalDamage, false, teammateIndex); // Damage to all teammates
              }
            });
          }
        }

        // If no attackAll, proceed with regular attack logic
        if (action.attack) {
          const totalAttack = action.attack + teamAttackBuffThisTurn;

          let targetIndex;

          // If opponentTargetIndex is provided, use it; otherwise, choose at random
          if (opponentTargetIndex !== null) {
            targetIndex = opponentTargetIndex;
          } else {
            // Filter alive targets
            let targetCandidates;
            if (isPlayerTeam) {
              // Filter out dead enemies
              targetCandidates = enemies.filter((enemy) => enemy.health > 0);
            } else {
              // Filter out dead teammates
              targetCandidates = playerTeam.filter(
                (member) => member.health > 0
              );
            }

            // If we have alive targets, pick one randomly
            if (targetCandidates.length > 0) {
              targetIndex = Math.floor(Math.random() * targetCandidates.length);
              if (isPlayerTeam) {
                targetIndex = enemies.indexOf(targetCandidates[targetIndex]);
              } else {
                targetIndex = playerTeam.indexOf(targetCandidates[targetIndex]);
              }
            }
          }

          // Apply attack damage to the selected target
          if (targetIndex !== undefined) {
            let finalDamage = totalAttack;

            // Apply battleFatigue modifier if applicable
            if (isPlayerTeam) {
              const target = enemies[targetIndex];
              if (target && target.health > 0) {
                if (target.battleFatigue !== null) {
                  if (turn > target.battleFatigue) {
                    finalDamage *= turn - target.battleFatigue + 2; // Apply scaling modifier if turn > battleFatigue
                  } else if (
                    turn >
                    target.battleFatigue / 2 + target.battleFatigue / 4
                  ) {
                    finalDamage *= 4;
                  } else if (turn > target.battleFatigue / 2) {
                    finalDamage *= 2; // Double the damage if turn > battleFatigue / 2
                  }
                }

                applyDamage(targetIndex, finalDamage, true, teammateIndex); // Use refactored applyDamage
              }
            } else {
              const target = playerTeam[targetIndex];
              if (target && target.health > 0) {
                if (target.battleFatigue !== null) {
                  if (turn > target.battleFatigue) {
                    finalDamage *= turn - target.battleFatigue + 2; // Apply scaling modifier if turn > battleFatigue
                  } else if (
                    turn >
                    target.battleFatigue / 2 + target.battleFatigue / 4
                  ) {
                    finalDamage *= 4;
                  } else if (turn > target.battleFatigue / 2) {
                    finalDamage *= 2; // Double the damage if turn > battleFatigue / 2
                  }
                }

                applyDamage(targetIndex, finalDamage, false, teammateIndex); // Use refactored applyDamage
              }
            }
          }
        }
      }

      return teammate;
    });
  };

  // Heal calculation function
  const calcHeal = (team, teamHealBuffThisTurn) => {
    return team.map((teammate) => {
      if (teammate.health <= 0) return teammate; // Skip dead teammates

      const action = teammate.actionPlayed; // Use action played for this turn

      // Individual heal
      if (action && action.heal) {
        const turnHeal = action.heal + teamHealBuffThisTurn;
        teammate.health = Math.min(
          teammate.maxHealth,
          teammate.health + turnHeal
        );
        console.log(`On turn ${turn}, ${teammate.name} healed by ${turnHeal}`);
      }

      // Heal all teammates (healAll)
      if (action && action.healAll) {
        const turnHealAll = action.healAll + teamHealBuffThisTurn;
        team.forEach((member) => {
          if (member.health > 0) {
            member.health = Math.min(
              member.maxHealth,
              member.health + turnHealAll
            );
          }
        });
        console.log(`On turn ${turn}, all teammates healed by ${turnHealAll}`);
      }

      return teammate;
    });
  };

  const applyDamage = (targetIndex, attackValue, isEnemy, attackerIndex) => {
    if (isEnemy) {
      // Apply damage to an enemy
      setEnemies((prevEnemies) => {
        const updatedEnemies = [...prevEnemies];
        const enemy = updatedEnemies[targetIndex];

        applyDamageLogic(enemy, attackValue);

        console.log(
          `On turn ${turn}, ${attackValue} damage was dealt to ${enemy.name} by teammate ${playerTeam[attackerIndex].name}`
        );

        // Check if all enemies are defeated
        if (updatedEnemies.every((e) => e.health <= 0)) {
          handleBattleEnd(true); // All enemies defeated
        }

        return updatedEnemies;
      });
    } else {
      // Apply damage to a teammate
      setPlayerTeam((prevTeam) => {
        const updatedTeam = [...prevTeam];
        const teammate = updatedTeam[targetIndex];

        applyDamageLogic(teammate, attackValue);

        console.log(
          `On Turn ${turn}, enemy ${enemies[attackerIndex].name} dealt ${attackValue} damage to ${teammate.name}`
        );

        // Check if all teammates are defeated
        if (updatedTeam.every((teammate) => teammate.health <= 0)) {
          handleBattleEnd(false); // All teammates defeated
        }

        return updatedTeam;
      });
    }
  };

  // Reusable logic for applying damage to a teammate or enemy
  const applyDamageLogic = (target, attackValue) => {
    let remainingDamage = attackValue;

    // First reduce defense
    if (target.currentDefence > 0) {
      if (target.currentDefence >= remainingDamage) {
        target.currentDefence -= remainingDamage;
        remainingDamage = 0; // No remaining damage
      } else {
        remainingDamage -= target.currentDefence;
        target.currentDefence = 0; // Defense is depleted
      }
    }

    // Apply remaining damage to health if any
    if (remainingDamage > 0) {
      target.health = Math.max(0, target.health - remainingDamage);
    }
  };

  const autoTriggerWeapon = ({
    teamWeapons,
    playerTeam,
    enemyTeam,
    teamCharge,
    triggerWeapon,
    currentWeaponIndex,
    setCurrentWeaponIndex,
    autoWeaponStatus,
  }) => {
    // If there are no teammates with weapons, do nothing
    if (teamWeapons.length === 0) {
      return;
    }

    // Get the current teammate index from the teamWeapons array
    let currentTeammateIndex = teamWeapons[currentWeaponIndex];

    // Find the teammate in playerTeam using the index
    let currentTeammate = playerTeam[currentTeammateIndex];

    // Check if the current teammate is dead (health is 0)
    while (currentTeammate && currentTeammate.health === 0) {
      // Remove the dead teammate from the teamWeapons array
      teamWeapons = teamWeapons.filter(
        (index) => index !== currentTeammateIndex
      );

      // If there are no more teammates with weapons, break the loop
      if (teamWeapons.length === 0) {
        return;
      }

      // Move to the next teammate in the teamWeapons array
      currentWeaponIndex = (currentWeaponIndex + 1) % teamWeapons.length;
      currentTeammateIndex = teamWeapons[currentWeaponIndex];
      currentTeammate = playerTeam[currentTeammateIndex];
    }

    if (
      currentTeammate &&
      currentTeammate.weapon &&
      currentTeammate.weapon.length > 0
    ) {
      const weapon = currentTeammate.weapon[0]; // Assuming one weapon per teammate

      // Check if the teamCharge is enough to trigger the weapon
      if (teamCharge >= weapon.chargeCost) {
        // Get valid enemies (with health > 0)
        const validEnemies = enemyTeam
          .map((enemy, index) =>
            enemy.health > 0 ? { index, health: enemy.health } : null
          )
          .filter((enemy) => enemy !== null);

        let targetEnemyIndex = null;

        // Determine the enemy to target based on autoWeaponStatus
        if (validEnemies.length > 0) {
          if (autoWeaponStatus === "random") {
            // Randomly select an enemy
            targetEnemyIndex =
              validEnemies[Math.floor(Math.random() * validEnemies.length)]
                .index;
          } else if (autoWeaponStatus === "highest health") {
            // Select the enemy with the highest health
            targetEnemyIndex = validEnemies.reduce((prev, curr) =>
              prev.health > curr.health ? prev : curr
            ).index;
          } else if (autoWeaponStatus === "lowest health") {
            // Select the enemy with the lowest health
            targetEnemyIndex = validEnemies.reduce((prev, curr) =>
              prev.health < curr.health ? prev : curr
            ).index;
          } else {
            // "off" or any invalid status, use random selection
            targetEnemyIndex =
              validEnemies[Math.floor(Math.random() * validEnemies.length)]
                .index;
          }

          // Trigger the weapon
          triggerWeapon({
            weaponAttacker: currentTeammateIndex,
            weaponEnemy: targetEnemyIndex,
            playerTeam: playerTeam,
            setPlayerTeam: setPlayerTeam,
            enemyTeam: enemyTeam,
            setWeaponPlayed: setWeaponPlayed,
            applyDamage: applyDamage,
            teamCharge: teamCharge,
            setTeamCharge: setTeamCharge,
          });

          // Reduce the teamCharge by the weapon's charge cost
          teamCharge -= weapon.chargeCost;

          // Move to the next weapon in the teamWeapons array
          setCurrentWeaponIndex((currentWeaponIndex + 1) % teamWeapons.length); // Loop back if we reach the end

          return targetEnemyIndex;
        }
      }
    }
  };

  const toggleAutoWeaponStatus = () => {
    const currentStatus = playerData[0].autoWeaponStatus;
    let newStatus;

    switch (currentStatus) {
      case "off":
        newStatus = "random";
        break;
      case "random":
        newStatus = "highest health";
        break;
      case "highest health":
        newStatus = "lowest health";
        break;
      case "lowest health":
        newStatus = "off";
        break;
      default:
        newStatus = "off";
        break;
    }

    // Update playerData with the new status
    setPlayerData((prevData) => [
      {
        ...prevData[0],
        autoWeaponStatus: newStatus,
      },
    ]);
  };

  return (
    <div className="battle-container">
      {!isBattleStarted && (
        <div className="battle-modal-container">
          <div className="battle-modal">
            <Button text={"Start Battle"} onClick={handleStartBattle}></Button>
          </div>
        </div>
      )}
      <div className="battle-info">
        {battleEnded && (
          <div className="battle-modal-container">
            <div className="battle-modal">
              {win ? (
                <>
                  <h3>All Enemies Defeated! You Win!</h3>
                  <Button
                    text={"Back to Home"}
                    onClick={handleCloseBattle}
                  ></Button>
                </>
              ) : (
                <>
                  <h3>You fainted!</h3>
                  <Button
                    text={"Back to Home"}
                    onClick={handleFainted}
                  ></Button>
                </>
              )}
            </div>
          </div>
        )}

        {!battleEnded && (
          <div className="turn-info">
            <p>Turn: {turn}</p>
            <p>Difficulty: {difficulty}</p>
            <div>
              <button onClick={handlePause}>
                {paused ? "Resume" : "Pause"}
              </button>
              <button onClick={handleSlowSpeed}>Slow</button>
              <button onClick={handleNormalSpeed}>Normal</button>
              <button onClick={handleFastSpeed}>Fast</button>
            </div>
            <button onClick={toggleAutoWeaponStatus}>
              Toggle Auto Weapon Status (Current:{" "}
              {playerData[0].autoWeaponStatus})
            </button>
            <div>{weaponPlayed && <p>{weaponPlayed.name}</p>}</div>
            {mana && <ManaIcon colour={mana} />}
          </div>
        )}
      </div>

      <ChargeBar charge={enemyCharge} isPlayerTeam={false} />

      {/* Render Enemy Component */}
      <Enemy
        enemies={enemies}
        enemyActions={enemies.map((enemy, enemyIndex) => enemy.actionPlayed)}
        turn={turn}
        opponentTarget={opponentTarget}
        setOpponentTarget={setOpponentTarget}
        setWeaponAttacker={setWeaponAttacker}
        setWeaponEnemy={setWeaponEnemy}
        weaponAnimation={weaponAnimation}
      />

      {/* Render Team Component */}
      <Team
        playerTeam={playerTeam}
        teamCharge={teamCharge}
        turn={turn}
        autoWeaponStatus={playerData[0].autoWeaponStatus}
      />

      <ChargeBar charge={teamCharge} isPlayerTeam={true} />
    </div>
  );
};

export default Battle;
