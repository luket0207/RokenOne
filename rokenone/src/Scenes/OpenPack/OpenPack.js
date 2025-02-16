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

    // Calculate base cost
    const baseCost = rarityCostMapping[rarity];
    const additionalCost = classTierCostMapping[classTier] || 0;
    let totalCost = baseCost + additionalCost;

    // Find best available token
    const availableTokens = playerData[0]?.packTokens || [];
    const bestToken = availableTokens
      .filter((token) => {
        const tokenType = token.type.toLowerCase();
        const packType = (actionClass || actionType || "normal").toLowerCase();

        // Apply "normal" tokens only to standard packs
        if (tokenType === "normal") return packType === "normal";

        return tokenType === packType;
      })
      .sort((a, b) => b.discount - a.discount)[0]; // Use the highest discount

    // Apply discount if a token is found
    if (bestToken) {
      totalCost = Math.floor(
        totalCost - (totalCost * bestToken.discount) / 100
      );
    }

    // Function to check if enough currency is available
    const checkCurrency = (actionClass, cost) => {
      const currency = spentCurrency(actionClass);
      const currentCurrency = playerData[0][currency]; // Use playerData[0]
      return currentCurrency >= cost;
    };

    // Check currency availability after discount
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

    // Spend discounted currency
    spendCurrency(spentCurrency(actionClass), totalCost);

    // Remove or decrement token after use
    if (bestToken) {
      setPlayerData((prevData) => {
        if (!prevData[0]?.packTokens) return prevData;

        const updatedTokens = prevData[0].packTokens
          .map((token) => {
            if (
              token.type.toLowerCase() === bestToken.type.toLowerCase() &&
              token.discount === bestToken.discount
            ) {
              return { ...token, quantity: token.quantity - 1 };
            }
            return token;
          })
          .filter((token) => token.quantity > 0); // Remove tokens with 0 quantity

        return [
          {
            ...prevData[0],
            packTokens: updatedTokens,
          },
        ];
      });
    }

    setTimeout(() => {
      setOpened(true);
    }, 100);

    // Use the updater callback to update the cardBank while preserving state shape
    setPlayerData((prevData) => {
      if (!prevData || !prevData[0]) return prevData;

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
            {[
              { title: "Standard Packs", classType: "normal", noTiers: true },
              { title: "Roken Packs", classType: "Roken" },
              { title: "Samurai Packs", classType: "Samurai" },
              { title: "O-Yoroi Packs", classType: "Oyoroi" },
              { title: "Weapon Packs", classType: "Weapon", isType: true },
            ].map(({ title, classType, isType, noTiers }) => (
              <div key={classType}>
                <h3>{title}</h3>
                <div className="pack-group">
                  {["common", "uncommon", "rare", "epic", "legendary"].map(
                    (rarity) => {
                      // Define available tiers or just 1 iteration for standard packs
                      const classTiers = noTiers ? [0] : [1, 2, 3];

                      return classTiers.map((classTier) => {
                        // Calculate base cost
                        const baseCostMapping = {
                          common: 10,
                          uncommon: 25,
                          rare: 50,
                          epic: 100,
                          legendary: 250,
                        };
                        const classTierCostMapping = { 1: 25, 2: 50, 3: 100 };
                        const baseCost = baseCostMapping[rarity];
                        const classTierCost = noTiers
                          ? 0
                          : classTierCostMapping[classTier] || 0;
                        const totalCost = baseCost + classTierCost;

                        // Find best available token
                        const availableTokens = playerData[0]?.packTokens || [];

                        const bestToken = availableTokens
                          .filter((token) => {
                            const tokenType = token.type.toLowerCase();
                            const packType = classType.toLowerCase();

                            // Apply "normal" tokens only to standard packs
                            if (tokenType === "normal") {
                              return packType === "normal";
                            }

                            // Otherwise, match by classType or type
                            return tokenType === packType;
                          })
                          .sort((a, b) => b.discount - a.discount)[0];

                        // Apply discount if a token exists
                        const discountedCost = bestToken
                          ? Math.floor(
                              totalCost - (totalCost * bestToken.discount) / 100
                            )
                          : totalCost;

                        return (
                          <Pack
                            key={`${rarity}-${classTier}`}
                            rarity={rarity}
                            cost={discountedCost}
                            actionClass={
                              !isType && !noTiers ? classType : undefined
                            }
                            actionType={isType ? classType : undefined}
                            classTier={noTiers ? undefined : classTier}
                            onClick={handleOpenPack}
                            discount={bestToken ? bestToken.discount : null}
                            canAfford={(() => {
                              const currencyType = spentCurrency(classType);
                              const playerCurrency =
                                playerData[0][currencyType] || 0;
                              return playerCurrency >= discountedCost;
                            })()}
                          />
                        );
                      });
                    }
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            text={"Add Test Weapon Card"}
            onClick={handleAddTestCard}
            type="secondary"
          />
        </>
      )}

      {packOpened && (
        <div className={`pack ${opened ? "opened" : ""}`}>
          {packOpened
            .slice()
            .sort((a, b) => a.rarity - b.rarity)
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
