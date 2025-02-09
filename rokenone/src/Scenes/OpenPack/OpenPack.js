import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./OpenPack.scss";
import Button from "../../Components/Button/Button";
import actionsAllData from "../../Data/Actions/All.json";
import actionsRokenData from "../../Data/Actions/Roken.json";
import actionsSamuraiData from "../../Data/Actions/Samurai.json";
import actionsOyoroiData from "../../Data/Actions/Oyoroi.json";
import weaponsData from "../../Data/Weapons/Weapons.json";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import ActionCard from "../../Components/ActionCard/ActionCard";
import Pack from "../../Components/Pack/Pack";

const OpenPack = () => {
  const navigate = useNavigate();
  const { playerData, setPlayerData, spendCurrency } =
    useContext(GameDataContext);
  const [packOpened, setPackOpened] = useState(null);
  const [packOpenedName, setPackOpenedName] = useState(null);
  const [packOpenedRarity, setPackOpenedRarity] = useState(null);
  const [packOpenedClass, setPackOpenedClass] = useState(null);
  const [packOpenedClassTier, setPackOpenedClassTier] = useState(null);
  const [packOpenedType, setPackOpenedType] = useState(null);
  const [opened, setOpened] = useState(false); // Track whether the pack is opened
  const [animationComplete, setAnimationComplete] = useState(true); // Track if animation is complete

  const spentCurrency = (actionClass) => {
    // Map action classes to their respective dust types
    const dustMapping = {
      All: "coins",
      Roken: "dustRoken",
      Samurai: "dustSamurai",
      Oyoroi: "dustOyoroi",
      Kobo: "dustKobo",
      Taiko: "dustTaiko",
      Genso: "dustGenso",
    };

    // Return the corresponding dust type or default to "coins"
    return dustMapping[actionClass] || "coins";
  };

  // Function to calculate selection probabilities based on rarity and pack tier
  const getActionWithRarity = (rarity, actionType, actionClass, classTier) => {
    const rarityChances = {
      common: { 0: 100, 1: 15, 2: 5, 3: 1, 4: 0 },
      uncommon: { 0: 40, 1: 40, 2: 10, 3: 5, 4: 1 },
      rare: { 0: 10, 1: 40, 2: 40, 3: 8, 4: 2 },
      epic: { 0: 5, 1: 10, 2: 40, 3: 40, 4: 5 },
      legendary: { 0: 0, 1: 5, 2: 30, 3: 40, 4: 20 },
    };

    const getClassLikelihood = (classTier) => {
      const tierProbabilities = {
        0: [0, 0, 0, 0], // Tier 0
        1: [0.75, 0.5, 0, 0], // Tier 1
        2: [1, 0.5, 0, 0], // Tier 2
        3: [1, 0.75, 0.5, 0], // Tier 3
      };
      return tierProbabilities[classTier] || [0, 0, 0, 0];
    };

    const classProbabilities = getClassLikelihood(classTier);
    const combinedData = [
      ...actionsAllData.map((action) => ({ ...action })),
      ...actionsRokenData.map((action) => ({ ...action })),
      ...actionsSamuraiData.map((action) => ({ ...action })),
      ...actionsOyoroiData.map((action) => ({ ...action })),
      ...weaponsData.map((weapon) => ({ ...weapon })),
    ];

    const selectedActions = [];

    // Iterate for 4 cards to select
    for (let i = 0; i < 4; i++) {
      const classProbability = classProbabilities[i] || 0;
      let filteredActions = combinedData;

      if (Math.random() < classProbability) {
        // If we are matching by class/type
        filteredActions = combinedData.filter((action) => {
          const typeMatches = actionType ? action.type === actionType : true;
          const classMatches = actionClass
            ? action.class === actionClass
            : true;
          return typeMatches && classMatches;
        });
      }

      // If no matches, use the entire combinedData
      const actionsToUse =
        filteredActions.length > 0 ? filteredActions : combinedData;

      // Select based on rarity
      const selectedRarityChances = rarityChances[rarity];
      const weightedActions = actionsToUse.flatMap((action) => {
        const weight = Math.max(
          0,
          Math.floor(selectedRarityChances[action.rarity] || 0)
        );
        return Array(weight).fill(action);
      });

      const randomIndex = Math.floor(Math.random() * weightedActions.length);
      selectedActions.push(weightedActions[randomIndex]);
    }

    return selectedActions;
  };

  const handleOpenPack = (rarity, actionType, actionClass, classTier) => {
    // Rarity mapping to cost values
    const rarityCostMapping = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 250,
    };

    // ClassTier mapping to additional cost
    const classTierCostMapping = {
      1: 25,
      2: 50,
      3: 100,
    };

    // Function to check if enough currency is available
    const checkCurrency = (actionClass, cost) => {
      const currency = spentCurrency(actionClass);
      const currentCurrency = playerData[0][currency]; // Use playerData[0]
      return currentCurrency >= cost;
    };

    // Calculate cost
    const baseCost = rarityCostMapping[rarity];
    const additionalCost = classTierCostMapping[classTier] || 0;
    const totalCost = baseCost + additionalCost;

    // Check currency availability
    if (!checkCurrency(actionClass, totalCost)) {
      alert(
        `You don't have enough ${
          actionClass === "all" || actionClass === ""
            ? "coins"
            : `${actionClass} dust`
        } to open this pack.`
      );
      return; // Not enough currency
    }

    setAnimationComplete(false);

    // Determine and set pack details
    const classOrType = actionClass || actionType || "";
    const tierLabel = classTier > 0 ? `Tier ${classTier}` : "";
    let packName = `${rarity} Pack`;
    if (classOrType) {
      packName = `${rarity} ${classOrType} Pack`;
    }
    if (tierLabel) {
      packName += ` - ${tierLabel}`;
    }
    setPackOpenedName(packName);
    setPackOpenedRarity(rarity);
    setPackOpenedClass(actionClass);
    setPackOpenedType(actionType);
    setPackOpenedClassTier(classTier);

    // Get the selected actions from your helper
    const selectedActions = getActionWithRarity(
      rarity,
      actionType,
      actionClass,
      classTier
    );
    setPackOpened(selectedActions);

    // Spend currency (this function already uses the updater callback correctly)
    spendCurrency(spentCurrency(actionClass), totalCost);

    setTimeout(() => {
      setOpened(true);
    }, 100);

    // Use the updater callback to update the cardBank while preserving state shape
    setPlayerData((prevData) => {
      // Ensure we have the proper structure
      if (!prevData || !prevData[0]) return prevData;

      // Use playerData[0].cardBank, not playerData.cardBank
      const currentCardBank = [...(prevData[0].cardBank || [])];

      selectedActions.forEach((action) => {
        const existingActionIndex = currentCardBank.findIndex(
          (card) => card.id === action.id
        );

        if (existingActionIndex !== -1) {
          // Increase quantity if the card already exists
          currentCardBank[existingActionIndex] = {
            ...currentCardBank[existingActionIndex],
            quantity: currentCardBank[existingActionIndex].quantity + 1,
          };
        } else {
          // Otherwise, add the new card with a quantity of 1
          currentCardBank.push({ ...action, quantity: 1 });
        }
      });

      // Return the updated state as an array with one object
      return [
        {
          ...prevData[0],
          cardBank: currentCardBank,
        },
      ];
    });

    setTimeout(() => {
      setAnimationComplete(true);
    }, 15000);
  };

  const handleAddTestCard = () => {
    const testCard = actionsAllData.find((action) => action.id === "TEST001");

    setAnimationComplete(true);

    if (!testCard) {
      console.error("Test card not found in actionsData.");
      return;
    }

    setPlayerData((prevData) => {
      if (!prevData) {
        return prevData;
      }

      const updatedCardBank = prevData.cardBank || [];

      const existingActionIndex = updatedCardBank.findIndex(
        (card) => card.id === testCard.id
      );

      if (existingActionIndex !== -1) {
        updatedCardBank[existingActionIndex].quantity += 1;
      } else {
        updatedCardBank.push({ ...testCard, quantity: 1 });
      }

      return [
        {
          ...prevData[0],
          cardBank: updatedCardBank,
        },
      ];
    });
  };

  const handleContinue = () => {
    navigate("/home");
    setPackOpenedName("");
    setPackOpenedRarity("");
    setPackOpenedClass("");
    setPackOpenedType("");
    setPackOpenedClassTier("");
  };

  return (
    <div className="open-pack">
      <h1>Open Pack</h1>
      <p>{packOpenedName}</p>
      {!packOpened && (
        <>
          <div className="pack-selection">
            <h3>Standard Packs</h3>
            <Pack rarity={"common"} cost={10} onClick={handleOpenPack} />
            <Pack rarity={"uncommon"} cost={25} onClick={handleOpenPack} />
            <Pack rarity={"rare"} cost={50} onClick={handleOpenPack} />
            <Pack rarity={"epic"} cost={100} onClick={handleOpenPack} />
            <Pack rarity={"legendary"} cost={250} onClick={handleOpenPack} />
            <h3>Roken Packs</h3>
            {["common", "uncommon", "rare", "epic", "legendary"].map(
              (rarity) => {
                // Get the cost dynamically for each rarity and classTier combination
                return (
                  <React.Fragment key={rarity}>
                    {[1, 2, 3].map((classTier) => {
                      // Calculate cost based on rarity and classTier
                      const baseCostMapping = {
                        common: 10,
                        uncommon: 25,
                        rare: 50,
                        epic: 100,
                        legendary: 250,
                      };
                      const classTierCostMapping = {
                        1: 25,
                        2: 50,
                        3: 100,
                      };

                      const baseCost = baseCostMapping[rarity];
                      const classTierCost =
                        classTierCostMapping[classTier] || 0;

                      const totalCost = baseCost + classTierCost;

                      return (
                        <React.Fragment key={classTier}>
                          <Pack
                            rarity={rarity}
                            actionClass="Roken"
                            classTier={classTier}
                            cost={totalCost} // Set dynamic cost here
                            onClick={handleOpenPack}
                          />
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }
            )}

            <h3>Samurai Packs</h3>
            {["common", "uncommon", "rare", "epic", "legendary"].map(
              (rarity) => {
                // Get the cost dynamically for each rarity and classTier combination
                return (
                  <React.Fragment key={rarity}>
                    {[1, 2, 3].map((classTier) => {
                      // Calculate cost based on rarity and classTier
                      const baseCostMapping = {
                        common: 10,
                        uncommon: 25,
                        rare: 50,
                        epic: 100,
                        legendary: 250,
                      };
                      const classTierCostMapping = {
                        1: 25,
                        2: 50,
                        3: 100,
                      };

                      const baseCost = baseCostMapping[rarity];
                      const classTierCost =
                        classTierCostMapping[classTier] || 0;

                      const totalCost = baseCost + classTierCost;

                      return (
                        <React.Fragment key={classTier}>
                          <Pack
                            rarity={rarity}
                            actionClass="Samurai"
                            classTier={classTier}
                            cost={totalCost} // Set dynamic cost here
                            onClick={handleOpenPack}
                          />
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }
            )}

            <h3>O-Yoroi Packs</h3>
            {["common", "uncommon", "rare", "epic", "legendary"].map(
              (rarity) => {
                // Get the cost dynamically for each rarity and classTier combination
                return (
                  <React.Fragment key={rarity}>
                    {[1, 2, 3].map((classTier) => {
                      // Calculate cost based on rarity and classTier
                      const baseCostMapping = {
                        common: 10,
                        uncommon: 25,
                        rare: 50,
                        epic: 100,
                        legendary: 250,
                      };
                      const classTierCostMapping = {
                        1: 25,
                        2: 50,
                        3: 100,
                      };

                      const baseCost = baseCostMapping[rarity];
                      const classTierCost =
                        classTierCostMapping[classTier] || 0;

                      const totalCost = baseCost + classTierCost;

                      return (
                        <React.Fragment key={classTier}>
                          <Pack
                            rarity={rarity}
                            actionClass="Oyoroi"
                            classTier={classTier}
                            cost={totalCost} // Set dynamic cost here
                            onClick={handleOpenPack}
                          />
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }
            )}

            <h3>Weapon Packs</h3>
            {["common", "uncommon", "rare", "epic", "legendary"].map(
              (rarity) => {
                // Get the cost dynamically for each rarity and classTier combination
                return (
                  <React.Fragment key={rarity}>
                    {[1, 2, 3].map((classTier) => {
                      // Calculate cost based on rarity and classTier
                      const baseCostMapping = {
                        common: 10,
                        uncommon: 25,
                        rare: 50,
                        epic: 100,
                        legendary: 250,
                      };
                      const classTierCostMapping = {
                        1: 25,
                        2: 50,
                        3: 100,
                      };

                      const baseCost = baseCostMapping[rarity];
                      const classTierCost =
                        classTierCostMapping[classTier] || 0;

                      const totalCost = baseCost + classTierCost;

                      return (
                        <React.Fragment key={classTier}>
                          <Pack
                            rarity={rarity}
                            actionType="Weapon"
                            classTier={classTier}
                            cost={totalCost} // Set dynamic cost here
                            onClick={handleOpenPack}
                          />
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              }
            )}
          </div>

          <Button
            text={"Add Test Weapon Card"}
            onClick={handleAddTestCard}
            type="secondary"
          />
        </>
      )}

      {packOpened && (
        <div>
          <div className={`pack ${opened ? "opened" : ""}`}>
            {packOpened
              .slice()
              .sort((a, b) => a.rarity - b.rarity) // Sort actions by rarity, lowest first
              .map((action, index) => (
                <div
                  key={index}
                  className={`available-actions-action card-${index + 1}`}
                  style={{ animationDelay: `${(index + 1) * 3}s` }}
                >
                  <ActionCard action={action} noAnimation={true} />
                </div>
              ))}

            <div className="pack-image">
              <Pack
                rarity={packOpenedRarity}
                actionClass={packOpenedClass}
                actionType={packOpenedType}
                classTier={packOpenedClassTier}
                noAnimate
              />
            </div>
          </div>
        </div>
      )}

      <Button
        text={"Home"}
        onClick={handleContinue}
        disabled={!animationComplete}
      />
    </div>
  );
};

export default OpenPack;
