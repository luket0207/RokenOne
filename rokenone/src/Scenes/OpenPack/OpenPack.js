import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OpenPack.scss";
import Button from "../../Components/Button/Button";
import actionsData from "../../Data/Actions/Actions.json";
import weaponsData from "../../Data/Weapons/Weapons.json";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import ActionCard from "../../Components/ActionCard/ActionCard";

const OpenPack = () => {
  const navigate = useNavigate();
  const { playerData, setPlayerData } = useContext(GameDataContext);
  const [packOpened, setPackOpened] = useState(null);
  const [opened, setOpened] = useState(false); // Track whether the pack is opened
  const [animationComplete, setAnimationComplete] = useState(false); // Track if animation is complete

  // Function to calculate selection probabilities based on rarity and pack tier
  const getActionWithRarity = (tier, actionType, actionClass, classTier) => {
    const rarityChances = {
      common: { 0: 100, 1: 40, 2: 10, 3: 5, 4: 1 },
      uncommon: { 0: 30, 1: 40, 2: 30, 3: 15, 4: 5 },
      rare: { 0: 10, 1: 30, 2: 40, 3: 30, 4: 15 },
      epic: { 0: 5, 1: 15, 2: 40, 3: 40, 4: 30 },
      legendary: { 0: 1, 1: 5, 2: 15, 3: 30, 4: 50 },
    };

    const getClassLikelihood = (classTier) => {
      const tierProbabilities = {
        0: [0, 0, 0, 0], // Tier 0
        1: [1, 0.5, 0, 0], // Tier 1
        2: [1, 0.75, 0, 0], // Tier 2
        3: [1, 1, 0.5, 0], // Tier 3
      };
      return tierProbabilities[classTier] || [0, 0, 0, 0];
    };

    const classProbabilities = getClassLikelihood(classTier);
    const combinedData = [
      ...actionsData.map((action) => ({ ...action })),
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
      const selectedRarityChances = rarityChances[tier];
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

  const handleOpenPack = (tier, actionType, actionClass, classTier) => {
    const selectedActions = getActionWithRarity(
      tier,
      actionType,
      actionClass,
      classTier
    );
    setPackOpened(selectedActions);

    setTimeout(() => {
      setOpened(true);
    }, 100);

    setPlayerData((prevData) => {
      if (!prevData) {
        return prevData;
      }

      const updatedCardBank = prevData.cardBank || [];

      selectedActions.forEach((action) => {
        const existingActionIndex = updatedCardBank.findIndex(
          (card) => card.id === action.id
        );

        if (existingActionIndex !== -1) {
          updatedCardBank[existingActionIndex].quantity += 1;
        } else {
          updatedCardBank.push({ ...action, quantity: 1 });
        }
      });

      return {
        ...prevData,
        cardBank: updatedCardBank,
      };
    });

    setTimeout(() => {
      setAnimationComplete(true);
    }, 15000);
  };

  const handleAddTestCard = () => {
    const testCard = actionsData.find((action) => action.id === "TEST001");

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

      return {
        ...prevData,
        cardBank: updatedCardBank,
      };
    });
  };

  const handleContinue = () => {
    navigate("/home");
  };

  return (
    <div className="open-pack">
      <h1>Open Pack</h1>

      {!packOpened && (
  <>
    <div className="pack-selection">
      {/* Existing Pack Buttons with type="small" */}
      <Button
        text={"Common Pack"}
        onClick={() => handleOpenPack("common", "", "", 0)}
        type="small"
      />
      <Button
        text={"Uncommon Pack"}
        onClick={() => handleOpenPack("uncommon", "", "", 0)}
        type="small"
      />
      <Button
        text={"Rare Pack"}
        onClick={() => handleOpenPack("rare", "", "", 0)}
        type="small"
      />
      <Button
        text={"Epic Pack"}
        onClick={() => handleOpenPack("epic", "", "", 0)}
        type="small"
      />
      <Button
        text={"Legendary Pack"}
        onClick={() => handleOpenPack("legendary", "", "", 0)}
        type="small"
      />

      {["common", "uncommon", "rare", "epic", "legendary"].map((rarity) => (
        <React.Fragment key={rarity}>
          {[0, 1, 2, 3].map((classTier) => (
            <React.Fragment key={classTier}>
              {/* For Class "Roken" with classTier */}
              <Button
                text={`${
                  rarity.charAt(0).toUpperCase() + rarity.slice(1)
                } Roken Tier ${classTier}`}
                onClick={() => handleOpenPack(rarity, "", "Roken", classTier)}
                type="small"
              />
              {/* For Type "Weapon" with classTier */}
              <Button
                text={`${
                  rarity.charAt(0).toUpperCase() + rarity.slice(1)
                } Weapon Tier ${classTier}`}
                onClick={() =>
                  handleOpenPack(rarity, "weapon", "", classTier)
                }
                type="small"
              />
            </React.Fragment>
          ))}
        </React.Fragment>
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
        <div>
          <div className={`pack ${opened ? "opened" : ""}`}>
            {packOpened
              .slice()
              .reverse()
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
              <h3>Pack</h3>
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
