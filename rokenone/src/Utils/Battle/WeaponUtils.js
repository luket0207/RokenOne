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
    const weaponAttack = weapon.attack + attacker.weapon[0].attackBoost; // Weapon attack value + any buffs

    if (weaponAttacker !== null && weaponEnemy !== null) {
      // Get the enemy who will receive the damage
      const targetEnemy = updatedEnemyTeam[weaponEnemy];

      if (targetEnemy && targetEnemy.health > 0) {
        // Apply damage to the enemy
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
