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

const Battle = () => {
  const { playerTeam, setPlayerTeam, resetExpedition, moveToNextDay } =
    useContext(GameDataContext);
  const { state } = useLocation(); // Retrieve the enemies passed from Home
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [battleEnded, setBattleEnded] = useState(false);
  const [win, setWin] = useState(false);
  const [enemies, setEnemies] = useState(state?.enemies || []); // Get enemies from the state
  const [weaponPlayed, setWeaponPlayed] = useState(null);
  const [weaponAttacker, setWeaponAttacker] = useState(null);
  const [weaponEnemy, setWeaponEnemy] = useState(null);
  const [weaponAnimation, setWeaponAnimation] = useState(null);
  const navigate = useNavigate();
  const [teamCharge, setTeamCharge] = useState(0);
  const [enemyCharge, setEnemyCharge] = useState(0);
  const [mana, setMana] = useState(null);
  const [opponentTarget, setOpponentTarget] = useState(null);
  const intervalRef = useRef(null); // Use ref for interval
  const [intervalTime, setIntervalTime] = useState(1000);
  const [paused, setPaused] = useState(false);
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
    moveToNextDay();
    navigate("/expeditionhome");
  };

  //Return the player to home because they fainted and clear the expedition
  const handleFainted = () => {
    resetExpedition();
    navigate("/home");
  };

  // Start the battle and set up the turn ticking mechanism
  const handleStartBattle = () => {
    setIsBattleStarted(true);
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
      black: 0.6,
      grey: 0.6,
      orange: 0.5,
      teal: 0.5,
      gold: 0.4,
      jade: 0.4,
      crimson: 0.3,
      emerald: 0.3,
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
        manaBoostEffect.forEach(([attribute, boostValue]) => {
          // Track original value, even if attribute is being created
          if (action.originalValues === undefined) {
            action.originalValues = {}; // Initialize if not present
          }

          if (action[attribute] !== undefined) {
            action.originalValues[attribute] = action[attribute]; // Save the original value
            action[attribute] += boostValue; // Apply the boost value
            console.log(
              `${attribute} was boosted by ${boostValue} because mana is ${mana}`
            );
          } else {
            action.originalValues[attribute] = undefined; // Track created attribute
            action[attribute] = boostValue; // Set the boost value
            console.log(
              `${attribute} was created and set to ${boostValue} because mana is ${mana}`
            );
          }
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
    const processActionsForTurn = (team) => {
      return team.map((teammate) => {
        if (teammate.health <= 0) {
          teammate.actionPlayed = null;
          return null;
        }

        let action = teammate.timeline[(turn - 1) % teammate.timeline.length];

        if (!action) {
          teammate.actionPlayed = null;
          return null;
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
        return action;
      });
    };

    const playerActions = processActionsForTurn(playerTeam);
    const enemyActions = processActionsForTurn(enemies);

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
    if (weaponAttacker !== null && weaponEnemy !== null) {
      const { updatedPlayerTeam, updatedEnemyTeam } = triggerWeapon({
        weaponAttacker,
        weaponEnemy,
        playerTeam: playerTeamWithHeal,
        enemyTeam: enemyTeamWithHeal,
        setWeaponPlayed,
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

  // Weapon Stuff
  const triggerWeapon = ({
    weaponAttacker,
    weaponEnemy,
    playerTeam,
    enemyTeam,
    setWeaponPlayed,
    weaponAttackerBuff = 0,
  }) => {
    console.log(`Triggered inside triggerWeapon ${playerTeam}`);
    const updatedPlayerTeam = [...playerTeam];
    const updatedEnemyTeam = [...enemyTeam];

    // Check if the attacker has a weapon
    const attacker = updatedPlayerTeam[weaponAttacker];

    console.log(
      `Weapon Attack - Attacker id: ${weaponAttacker} - Enemy id: ${weaponEnemy}`
    );

    if (attacker && attacker.weapon && attacker.weapon.length > 0) {
      const weapon = attacker.weapon[0]; // Assuming only one weapon per character for simplicity
      const weaponAttack = weapon.attack + weaponAttackerBuff; // Weapon attack value + any buffs

      if (weaponAttacker !== null && weaponEnemy !== null) {
        // Get the enemy who will receive the damage
        const targetEnemy = updatedEnemyTeam[weaponEnemy];

        if (targetEnemy && targetEnemy.health > 0) {
          // Apply damage to the enemy, just like calcAttack
          applyDamage(weaponEnemy, weaponAttack, true, weaponAttacker);

          console.log(
            `${attacker.name} attacked ${targetEnemy.name} with ${weapon.name}, causing ${weaponAttack} damage!`
          );
        } else {
          console.log(`${targetEnemy.name} is already defeated.`);
        }

        const updatedCharge = teamCharge - weapon.chargeCost;
        setTeamCharge(updatedCharge);

        // Set the weaponPlayed for the current turn
        setWeaponPlayed(weapon);
      }
    } else {
      console.log("This character doesn't have a weapon.");
    }

    // Return the updated teams after the weapon is triggered
    return {
      updatedPlayerTeam,
      updatedEnemyTeam,
    };
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
            <p>Target: {opponentTarget}</p>
            <div>
              <button onClick={handlePause}>
                {paused ? "Resume" : "Pause"}
              </button>
              <button onClick={handleSlowSpeed}>Slow</button>
              <button onClick={handleNormalSpeed}>Normal</button>
              <button onClick={handleFastSpeed}>Fast</button>
            </div>
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
        opponentTarget={opponentTarget}
        setOpponentTarget={setOpponentTarget}
        setWeaponAttacker={setWeaponAttacker}
        setWeaponEnemy={setWeaponEnemy}
        weaponAnimation={weaponAnimation}
      />

      {/* Render Team Component */}
      <Team playerTeam={playerTeam} teamCharge={teamCharge} turn={turn} />

      <ChargeBar charge={teamCharge} isPlayerTeam={true} />
    </div>
  );
};

export default Battle;
