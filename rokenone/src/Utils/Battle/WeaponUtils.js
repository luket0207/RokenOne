export const playerTeamWithWeapons = (playerTeam) => {
  // Map through the playerTeam and filter teammates who have a weapon
  const teammatesWithWeapons = playerTeam
    .map((teammate, index) =>
      teammate.weapon && teammate.weapon.length > 0 ? index : null
    ) // Check if teammate has a weapon
    .filter((index) => index !== null); // Remove null values (teammates without weapons)

  return teammatesWithWeapons; // Return an array of indices with weapons
};

export const triggerWeapon = ({
  weaponAttacker,
  weaponEnemy,
  playerTeam,
  setPlayerTeam,
  enemyTeam,
  setWeaponPlayed,
  applyDamage,
  teamCharge,
  setTeamCharge,
}) => {
  const updatedPlayerTeam = [...playerTeam];
  const updatedEnemyTeam = [...enemyTeam];

  

  // Check if the attacker has a weapon
  const attacker = updatedPlayerTeam[weaponAttacker];

  if (attacker && attacker.weapon && attacker.weapon.length > 0) {
    const weapon = attacker.weapon[0]; // Assuming only one weapon per character for simplicity
    const weaponAttack = weapon.attack; // Weapon attack value + any buffs
    console.log(weapon.cycle);
    // Save the initial stats of the weapon
    const initialStats = {
      attack: weapon.attack,
      chargeCost: weapon.chargeCost,
      health: weapon.health,
    };

    // Track if the chargeCost has been modified
    let chargeCostModified = false;
    let modifiedChargeCost = weapon.chargeCost;

    // Check for cycleBoost and handle accordingly
    if (weapon.cycleBoost !== undefined) {
      // Increment the cycle for the weapon each time it's triggered
      weapon.cycle = weapon.cycle ? weapon.cycle + 1 : 1;

      // Before applying cycleBoostEffect, reset the weapon stats to base values
      resetWeaponStats(weapon);

      // Apply cycleBoost effect if conditions are met
      if (
        (weapon.cycleBoost === 1 && weapon.cycle === 1) || // Apply if cycleBoost is 1 and cycle is 1
        (weapon.cycleBoost > 1 && weapon.cycle % weapon.cycleBoost === 0) // Apply every Nth cycle
      ) {
        applyCycleBoostEffect(weapon);

        // If chargeCost was modified during cycleBoostEffect, flag it and store the modified value
        if (weapon.chargeCost !== initialStats.chargeCost) {
          chargeCostModified = true;
          modifiedChargeCost = weapon.chargeCost; // Store the modified chargeCost
        }
      }

      // After boosting, apply the new stats for the attack (while they're still boosted)
      const boostedWeaponAttack = weapon.attack; // After cycleBoost

      // Proceed with attack logic if the weapon is used
      if (weaponAttacker !== null && weaponEnemy !== null) {
        // Get the enemy who will receive the damage
        const targetEnemy = updatedEnemyTeam[weaponEnemy];

        if (targetEnemy && targetEnemy.health > 0) {
          // Apply damage to the enemy using the boosted attack value
          applyDamage(weaponEnemy, boostedWeaponAttack, true, weaponAttacker);

          console.log(
            `${attacker.name} attacked ${targetEnemy.name} with ${weapon.name}, causing ${boostedWeaponAttack} damage!`
          );
        } else {
          console.log(`${targetEnemy.name} is already defeated.`);
        }

        // Update chargeCost after attack if it was modified
        if (chargeCostModified) {
          weapon.chargeCost = initialStats.chargeCost;
          chargeCostModified = false;
        }

        // Apply the modified chargeCost if it was changed by effects
        const updatedCharge = teamCharge - modifiedChargeCost;
        setTeamCharge(updatedCharge);

        // Set the weaponPlayed for the current turn
        setWeaponPlayed(weapon);

        // Update the charge cost in the global game state
        updatedPlayerTeam[weaponAttacker].weapon[0].chargeCost = weapon.chargeCost;
        setPlayerTeam(updatedPlayerTeam);
      }

      // Reset the weapon stats back to their initial values after the attack
      weapon.attack = initialStats.attack;
      weapon.health = initialStats.health;

      // Update the player's weapon cycle in playerTeam
      updatedPlayerTeam[weaponAttacker].weapon[0].cycle = weapon.cycle;
      setPlayerTeam(updatedPlayerTeam);
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

// Helper function to apply cycleBoostEffect
const applyCycleBoostEffect = (weapon) => {
  if (weapon.cycleBoostEffect && Array.isArray(weapon.cycleBoostEffect)) {
    weapon.cycleBoostEffect.forEach(([attribute, operation, boostValue]) => {
      switch (operation) {
        case "plus":
          weapon[attribute] += boostValue; // Add the boost value
          break;

        case "minus":
          weapon[attribute] -= boostValue; // Subtract the boost value
          break;

        case "times":
          weapon[attribute] *= boostValue; // Multiply by the boost value
          break;

        case "divide":
          weapon[attribute] /= boostValue; // Divide by the boost value
          break;

        case "equals":
          // Apply the value from another stat if boostValue is a string
          const targetValue =
            typeof boostValue === "string" ? weapon[boostValue] || 0 : boostValue;
          weapon[attribute] = targetValue;
          break;

        default:
          console.error(`Unknown operation: ${operation}`);
          break;
      }

      console.log(
        `Cycle Boost applied: ${attribute} was updated using operation ${operation} with boostValue ${boostValue}, new value: ${weapon[attribute]}`
      );
    });
  }
};

// Helper function to reset weapon stats to base values
const resetWeaponStats = (weapon) => {
  if (weapon.baseStats) {
    // Reset the weapon stats back to their base values (ensure no accumulated changes)
    weapon.attack = weapon.baseStats.attack;
    weapon.chargeCost = weapon.baseStats.chargeCost;
    weapon.health = weapon.baseStats.health;
    // Reset other stats if needed
  }
};

