import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loot.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import talismans from "../../Data/Talismans/Talismans.json";

// Define the rarity weights here so you can adjust them for balancing.
// The weight determines how common (higher weight) or rare (lower weight) a rarity is.
const TALISMAN_RARITY_WEIGHTS = [
  { rarity: 0, weight: 50 },
  { rarity: 1, weight: 20 },
  { rarity: 2, weight: 10 },
  { rarity: 3, weight: 5 },
  { rarity: 4, weight: 1 },
];

const Loot = () => {
  const navigate = useNavigate();
  const { moveToNextDay } = useContext(GameDataContext);

  // "phase" will control what the loot items display:
  // "preview" (show details), "mixed" (apply class and hide details),
  // "choose" (allow player selection), and "result" (show selected loot).
  const [phase, setPhase] = useState("preview");
  const [loot, setLoot] = useState([]);
  const [selectedLoot, setSelectedLoot] = useState(null);

  useEffect(() => {
    generateLoot();

    // After 3 seconds, move from preview to mixed stage.
    const previewTimer = setTimeout(() => {
      setPhase("mixed");

      // After 2 seconds in mixed stage, shuffle loot order and let the player choose.
      const mixedTimer = setTimeout(() => {
        // Shuffle the loot array using the Fisher–Yates algorithm.
        setLoot((prevLoot) => {
          const shuffledLoot = [...prevLoot];
          for (let i = shuffledLoot.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledLoot[i], shuffledLoot[j]] = [shuffledLoot[j], shuffledLoot[i]];
          }
          return shuffledLoot;
        });
        setPhase("choose");
      }, 2000);

      return () => clearTimeout(mixedTimer);
    }, 3000);

    return () => clearTimeout(previewTimer);
  }, []);

  const handleContinue = () => {
    moveToNextDay();
    navigate("/expeditionhome");
  };

  const generateLoot = () => {
    const loot1 = generateCoins(5, 10);
    const loot2 =
      Math.random() > 0.5 ? generateCoins(10, 20) : generateTalisman(0, 3);
    const loot3 = generateTalisman(0, 4);
    setLoot([loot1, loot2, loot3]);
  };

  const generateCoins = (min, max) => {
    // Create weighted values (lower coins more common)
    const weightedValues = Array(max - min + 1)
      .fill(0)
      .map((_, idx) => ({
        value: min + idx,
        weight: max - idx, // higher weight for lower values
      }));
    const totalWeight = weightedValues.reduce((sum, item) => sum + item.weight, 0);
    const randomNum = Math.random() * totalWeight;
    let currentWeight = 0;

    for (let item of weightedValues) {
      currentWeight += item.weight;
      if (randomNum <= currentWeight) {
        return { type: "coins", amount: item.value };
      }
    }
  };

  const generateTalisman = (minRarity, maxRarity) => {
    // First, filter the rarity weights to only include rarities in the allowed range.
    const rarityOptions = TALISMAN_RARITY_WEIGHTS.filter(
      (option) => option.rarity >= minRarity && option.rarity <= maxRarity
    );
    const totalWeight = rarityOptions.reduce((sum, option) => sum + option.weight, 0);
    const randomNum = Math.random() * totalWeight;
    let currentWeight = 0;
    let chosenRarity = rarityOptions[0].rarity; // default to first option

    // Choose a rarity based on the weighted chances.
    for (let option of rarityOptions) {
      currentWeight += option.weight;
      if (randomNum <= currentWeight) {
        chosenRarity = option.rarity;
        break;
      }
    }
    // Filter the available talismans to only those with the chosen rarity.
    const filteredTalismans = talismans.filter(
      (talisman) => talisman.rarity === chosenRarity
    );
    // Pick one at random.
    const randomTalisman =
      filteredTalismans[Math.floor(Math.random() * filteredTalismans.length)];
    return { type: "talisman", ...randomTalisman };
  };

  const handleLootSelection = (index) => {
    // Only allow selection in the "choose" phase.
    if (phase !== "choose") return;
    const chosenLoot = loot[index];
    setSelectedLoot(chosenLoot);
    setPhase("result");
    console.log("Player selected loot: ", chosenLoot);
  };

  const handleHome = () => {
    navigate("/home");
  };

  return (
    <div className="loot">
      <div className="loot-container">
        {phase === "result" ? (
          <div className="loot-result">
            {selectedLoot && (
              <>
                <p>You received:</p>
                {selectedLoot.type === "coins" ? (
                  <p>{selectedLoot.amount} Coins</p>
                ) : (
                  <p>Talisman: {selectedLoot.name}</p>
                )}
              </>
            )}
            <Button text={"Continue"} onClick={handleContinue} />
            <Button text={"Home"} onClick={handleHome} type="secondary" />
          </div>
        ) : (
          <div className="loot-items">
            {loot.map((item, index) => (
              <div
                key={index}
                className={`loot-item ${phase === "mixed" ? "mixed" : ""} ${phase === "choose" ? "choose" : ""}`}
                onClick={() => handleLootSelection(index)}
              >
                {phase === "preview" ? (
                  // In preview, show the loot details.
                  item.type === "coins" ? (
                    <p>{item.amount} Coins</p>
                  ) : (
                    <p>Talisman: {item.name} {item.rarity}</p>
                  )
                ) : (
                  // In mixed and choose phases, hide the details.
                  <h3>?</h3>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loot;
