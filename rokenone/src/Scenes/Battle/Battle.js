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
  const [win, setWin] = useState(false);
  const [enemies, setEnemies] = useState(state?.enemies || []); // Get enemies from the state
  const navigate = useNavigate();
  const [teamCharge, setTeamCharge] = useState(0);
  const [enemyCharge, setEnemyCharge] = useState(0);
  const [weather, setWeather] = useState(null);
  const intervalRef = useRef(null); // Use ref for interval
  const [intervalTime, setIntervalTime] = useState(1000);
  const availableWeather = [
    "clear",
    "cloudy",
    "rainy",
    "sunny",
    "windy",
    "snowy",
    "thunderstorms",
    "blizzard",
  ];

  useEffect(() => {
    if (isBattleStarted && !battleEnded) {
      clearInterval(intervalRef.current); // Clear previous interval
      intervalRef.current = setInterval(() => {
        setTurn((prevTurn) => prevTurn + 1); // Increment turn
      }, intervalTime);
    }

    // Cleanup the interval when the component unmounts or battle ends
    return () => clearInterval(intervalRef.current);
  }, [intervalTime, isBattleStarted, battleEnded]);

  const handleSlowSpeed = () => setIntervalTime(2000); // 2 seconds interval
  const handleNormalSpeed = () => setIntervalTime(1000); // 1 second interval
  const handleFastSpeed = () => setIntervalTime(500); // 0.5 second interval

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
          // Find the corresponding action in the actionArray
          const action = actionArray.find(
            (action) => action.action === `Action ${actionName}`
          );
  
          // If the action is null (empty slot), we can either:
          // - return null,
          // - or create a placeholder action (like an empty object or a custom message).
          if (action && action.type === "null") {
            return null; // Handle empty slots as null or skip them
          }
  
          return action; // Return the action as is
        });
  
        // Return the updated enemy with the timeline
        return {
          ...enemy,
          timeline, // Add the timeline to the enemy
        };
      });
  
      setEnemies(updatedEnemies); // Update enemies with timelines
    }
  }, [enemies, setEnemies]);
  

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
    navigate("/home");
  };

  // Start the battle and set up the turn ticking mechanism
  const handleStartBattle = () => {
    setIsBattleStarted(true);
    console.log("****************************//////////////////////////// NEW BATTLE STARTED ////////////////////////////****************************")
    intervalRef.current = setInterval(() => {
      setTurn((prevTurn) => prevTurn + 1); // Only increment the turn here
    }, 1000);
  };

  useEffect(() => {
    if (turn > 0 && !battleEnded) {
      const turnWeather = generateWeather(availableWeather);

      // Pass in the appropriate team, setTeam function, and whether it's the player team
      setWeather(turnWeather);
      handleTurn(playerTeam, setPlayerTeam, true, turnWeather); // For the player's team
      handleTurn(enemies, setEnemies, false, turnWeather); // For the enemy team
    }
  }, [turn]);

  const weatherList = [
    { type: "clear", rarity: "common", baseProbability: 0.5 },
    { type: "cloudy", rarity: "common", baseProbability: 0.5 },
    { type: "rainy", rarity: "uncommon", baseProbability: 0.3 },
    { type: "sunny", rarity: "uncommon", baseProbability: 0.3 },
    { type: "windy", rarity: "rare", baseProbability: 0.15 },
    { type: "snowy", rarity: "rare", baseProbability: 0.15 },
    { type: "thunderstorms", rarity: "very rare", baseProbability: 0.05 },
    { type: "blizzard", rarity: "very rare", baseProbability: 0.05 },
  ];

  // Function to generate weather
  const generateWeather = (availableWeather) => {
    if (stickWeather(weather)) {
      // Filter available weather from the weather list
      const filteredWeather = weatherList.filter((weather) =>
        availableWeather.includes(weather.type)
      );

      // Group the filtered weather by their rarities
      const rarityGroups = {
        common: filteredWeather.filter(
          (weather) => weather.rarity === "common"
        ),
        uncommon: filteredWeather.filter(
          (weather) => weather.rarity === "uncommon"
        ),
        rare: filteredWeather.filter((weather) => weather.rarity === "rare"),
        "very rare": filteredWeather.filter(
          (weather) => weather.rarity === "very rare"
        ),
      };

      // Adjust probabilities based on what's available
      const rarityWeights = {
        common: rarityGroups.common.length > 0 ? 0.5 : 0,
        uncommon: rarityGroups.uncommon.length > 0 ? 0.3 : 0,
        rare: rarityGroups.rare.length > 0 ? 0.15 : 0,
        "very rare": rarityGroups["very rare"].length > 0 ? 0.05 : 0,
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

      // Assign adjusted probabilities to each available weather
      const weatherProbabilities = filteredWeather.map((weather) => {
        const rarityProbability = rarityWeights[weather.rarity];
        const groupSize = rarityGroups[weather.rarity].length;
        return {
          ...weather,
          adjustedProbability: rarityProbability / groupSize,
        };
      });

      // Randomly choose a weather based on probabilities
      const randomValue = Math.random();
      let cumulativeProbability = 0;

      for (const weather of weatherProbabilities) {
        cumulativeProbability += weather.adjustedProbability;
        if (randomValue <= cumulativeProbability) {
          return weather.type;
        }
      }
    } else {
      return weather;
    }
  };

  const stickWeather = (weather) => {
    // Define the stick chances based on the weather type

    const stickChanceByWeather = {
      clear: 0.6, // 100% chance to stay the same
      cloudy: 0.6, // 50% chance to stay the same
      rainy: 0.4, // 40% chance to stay the same
      sunny: 0.4, // 50% chance to stay the same
      windy: 0.3, // 40% chance to stay the same
      snowy: 0.3, // 40% chance to stay the same
      thunderstorms: 0.2, // 30% chance to stay the same
      blizzard: 0.2, // 30% chance to stay the same
    };

    // Check if the weather type exists in the stickChanceByWeather
    const stickChance = stickChanceByWeather[weather];

    // If the weather type is not recognized, assume it should change (true)
    if (stickChance === undefined) {
      return true;
    }

    // Generate a random number to see if the weather should change
    const randomValue = Math.random(); // Generates a number between 0 and 1

    // Return false if the weather should stick (not change), true otherwise
    return randomValue >= stickChance;
  };

  const checkWeatherBoost = (
    weather,
    weatherBoost,
    weatherBoostEffect,
    action
  ) => {
    // If the weather matches the boost for this action
    if (weather === weatherBoost) {
      // Apply the weather boost effect to the action attributes
      if (Array.isArray(weatherBoostEffect)) {
        weatherBoostEffect.forEach(([attribute, boostValue]) => {
          // Check if the attribute exists and its current value is greater than 0
          if (action[attribute] !== undefined && action[attribute] > 0) {
            action[attribute] += boostValue; // Apply the boost to the corresponding attribute
            console.log(
              `${attribute} was boosted by ${boostValue} because it's ${weather}`
            );
          } else if (action[attribute] <= 0) {
            console.log(
              `${attribute} not boosted because its value is ${action[attribute]} (<= 0)`
            );
          } else {
            action[attribute] = boostValue; // If the attribute is missing, set the boosted value
          }
        });
      } else {
        console.error(
          "weatherBoostEffect is not an iterable array:",
          weatherBoostEffect
        );
      }
    }
    return action;
  };
  

  const handleTurn = (team, setTeam, isPlayerTeam, turnWeather) => {
    let teamBuffs = {
      attack: 0,
      defence: 0,
      heal: 0,
    };
  
    console.log(`Turn ${turn} it was ${turnWeather}`);
  
    // Step 1: Get the actions for this turn and apply weather boosts before buffs
    const actionsForTurn = team
      .map((teammate) => {
        if (teammate.health <= 0) {
          teammate.actionPlayed = null; // Dead teammates don't play any action
          return null; // Skip dead teammate
        }
  
        // Ensure there is a valid action in the timeline for this turn
        let action = teammate.timeline[(turn - 1) % teammate.timeline.length];
  
        if (!action) {
          console.log(
            `No action found for teammate ${teammate.name} in the timeline for turn ${turn}`
          );
          teammate.actionPlayed = null;
          return null; // Skip teammate if there's no valid action
        }
  
        // Store the action played for the turn
        teammate.actionPlayed = action;
  
        // Apply weather boost here, before applying buffs or other logic
        if (action.weatherBoost) {
          // Store original values of the attributes that will be boosted
          const originalValues = {};
          if (Array.isArray(action.weatherBoostEffect)) {
            action.weatherBoostEffect.forEach(([attribute]) => {
              if (action[attribute] !== undefined) {
                originalValues[attribute] = action[attribute]; // Save the original value
              }
            });
          }
  
          // Apply the weather boost
          action = checkWeatherBoost(
            turnWeather,
            action.weatherBoost,
            action.weatherBoostEffect,
            action
          );
  
          // Add the original values to the action, so we can restore them later
          action.originalValues = originalValues;
        }
  
        // Return the updated action after applying the weather boost
        return action;
      })
      .filter((action) => action !== null); // Remove dead teammates from the actions list
  
    // Step 2: Calculate buffs for the current team after weather boost
    calcBuffs(team, teamBuffs);
  
    // Step 3: Calculate defence and defenceAll for the current team
    let updatedTeam = calcDefence(team, teamBuffs.defence);
  
    // Step 4: Process charge actions
    updatedTeam = calcCharge(updatedTeam, isPlayerTeam);
  
    // Step 5: Process attack actions
    updatedTeam = calcAttack(updatedTeam, teamBuffs.attack, isPlayerTeam);
  
    // Step 6: Process healing actions
    updatedTeam = calcHeal(updatedTeam, teamBuffs.heal);
  
    // Step 7: Remove weather boost effects at the end of the turn
    updatedTeam = updatedTeam.map((teammate) => {
      if (teammate.actionPlayed && teammate.actionPlayed.originalValues) {
        // Revert any changes made by the weather boost effect
        const { originalValues } = teammate.actionPlayed;
        Object.keys(originalValues).forEach((attribute) => {
          if (teammate.actionPlayed[attribute] !== undefined) {
            teammate.actionPlayed[attribute] = originalValues[attribute]; // Restore the original value
          }
        });
        // Remove the stored original values
        delete teammate.actionPlayed.originalValues;
      }
      return teammate;
    });
  
    // Update the team state with the processed actions
    setTeam(updatedTeam);
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
        teammate.currentDefence = (teammate.currentDefence || 0) + turnDefence;
        console.log(
          `On turn ${turn}, ${teammate.name} defended with ${turnDefence}`
        );
      }

      if (action && action.defenceAll) {
        const turnDefenceAll = action.defenceAll + teamDefenceBuffThisTurn;
        team.forEach((member) => {
          if (member.health > 0) {
            member.currentDefence =
              (member.currentDefence || 0) + turnDefenceAll;
          }
        });
        console.log(
          `On turn ${turn}, all teammates received ${turnDefenceAll} defence`
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

  // Attack calculation function
  const calcAttack = (team, teamAttackBuffThisTurn, isPlayerTeam) => {
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
                applyDamage(enemyIndex, totalAttackAll, true, teammateIndex); // Damage to all enemies
              }
            });
          } else {
            // Apply damage to all teammates
            playerTeam.forEach((member, memberIndex) => {
              if (member.health > 0) {
                applyDamage(memberIndex, totalAttackAll, false, teammateIndex); // Damage to all teammates
              }
            });
          }
        }

        // If no attackAll, proceed with regular attack logic
        if (action.attack) {
          const totalAttack = action.attack + teamAttackBuffThisTurn;

          if (isPlayerTeam) {
            const aliveEnemies = enemies.filter((enemy) => enemy.health > 0);
            if (aliveEnemies.length > 0) {
              const randomEnemyIndex = Math.floor(
                Math.random() * aliveEnemies.length
              );
              const enemyIndexInOriginalArray = enemies.findIndex(
                (enemy) => enemy === aliveEnemies[randomEnemyIndex]
              );
              applyDamage(
                enemyIndexInOriginalArray,
                totalAttack,
                true,
                teammateIndex
              ); // Use refactored applyDamage
            }
          } else {
            const aliveTeammates = playerTeam.filter(
              (member) => member.health > 0
            );
            if (aliveTeammates.length > 0) {
              const randomTeammateIndex = Math.floor(
                Math.random() * aliveTeammates.length
              );
              const teammateIndexInOriginalArray = playerTeam.findIndex(
                (member) => member === aliveTeammates[randomTeammateIndex]
              );
              applyDamage(
                teammateIndexInOriginalArray,
                totalAttack,
                false,
                teammateIndex
              ); // Use refactored applyDamage
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

  return (
    <div className="battle-container">
      <button className="close-battle" onClick={handleCloseBattle}>
        <FontAwesomeIcon icon={faXmark} />
      </button>

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
                <h3>All Enemies Defeated! You Win!</h3>
              ) : (
                <h3>You're Dead</h3>
              )}

              <Button
                text={"Back to Home"}
                onClick={handleCloseBattle}
              ></Button>
            </div>
          </div>
        )}

        {!battleEnded && (
          <div className="turn-info">
            <p>Turn: {turn}</p>
            <p>Weather: {weather}</p>
            <button onClick={handleSlowSpeed}>Slow</button>
            <button onClick={handleNormalSpeed}>Normal</button>
            <button onClick={handleFastSpeed}>Fast</button>
          </div>
        )}
      </div>

      <div className="team-charge">
        <div className="team-charge-icons">
          {/* Render 10 icons, conditionally applying the 'filled' class based on teamCharge */}
          {[...Array(10)].map((_, index) => (
            <span
              key={index}
              className={`charge-icon ${index < enemyCharge ? "filled" : ""}`} // Add 'filled' class for filled icons
            ></span>
          ))}
        </div>
      </div>

      {/* Render Enemy Component */}
      <Enemy
        enemies={enemies}
        enemyActions={enemies.map((enemy, enemyIndex) => enemy.actionPlayed)}
      />
      {/* Render ActionPool Component */}
      <ActionPool playerTeam={playerTeam} turn={turn} />

      <div className="team-charge">
        <div className="team-charge-icons">
          {/* Render 10 icons, conditionally applying the 'filled' class based on teamCharge */}
          {[...Array(10)].map((_, index) => (
            <span
              key={index}
              className={`charge-icon ${index < teamCharge ? "filled" : ""}`} // Add 'filled' class for filled icons
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Battle;
