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
  const getActionWithRarity = (tier, actionType, actionClass) => {
    // Adjust rarity chances based on the selected pack tier
    const rarityChances = {
      low: {
        0: 100,
        1: 40,
        2: 10,
        3: 0.9,
        4: 0.1, // Low tier pack (common cards are more frequent, legendaries are rare)
      },
      medium: {
        0: 30,
        1: 40,
        2: 30,
        3: 10,
        4: 2, // Medium tier pack (balanced)
      },
      high: {
        0: 10,
        1: 30,
        2: 40,
        3: 30,
        4: 10, // High tier pack (legendaries are more frequent, common cards are less frequent)
      },
    };

    // Combine actionsData and weaponsData into a single array
    const combinedData = [
      ...actionsData.map((action) => ({ ...action })),
      ...weaponsData.map((weapon) => ({ ...weapon })),
    ];

    // Filter the combined actions based on actionType and actionClass
    const filteredActions = combinedData.filter((action) => {
      // Check if actionType matches (if provided)
      const typeMatches = actionType ? action.type === actionType : true;
      // Check if actionClass matches (if provided)
      const classMatches = actionClass ? action.class === actionClass : true;

      // Include action only if both filters match (or if no filter is applied)
      return typeMatches && classMatches;
    });

    // Get the rarity chances for the selected pack tier
    const selectedRarityChances = rarityChances[tier];

    // Generate a weighted list of actions based on the rarity chances for the selected tier
    const weightedActions = filteredActions.flatMap((action) => {
      const weight = Math.max(
        0,
        Math.floor(selectedRarityChances[action.rarity] || 0)
      ); // Ensure weight is a valid non-negative integer
      return Array(weight).fill(action); // Repeat actions based on their rarity chance
    });

    // Randomly pick 4 actions from the weighted list (with potential duplicates)
    const selectedActions = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * weightedActions.length);
      selectedActions.push(weightedActions[randomIndex]);
    }

    return selectedActions;
  };

  const handleOpenPack = (tier, actionType, actionClass) => {
    console.log(tier, actionType, actionClass);
    const selectedActions = getActionWithRarity(tier, actionType, actionClass);
    setPackOpened(selectedActions);

    // Trigger the opening animation after a slight delay to apply transition
    setTimeout(() => {
      setOpened(true);
    }, 100); // Delay to allow initial state to set

    // Add the selected actions to the cardBank
    setPlayerData((prevData) => {
      if (!prevData) {
        return prevData; // Early return if prevData is undefined or null
      }

      // Ensure that cardBank is initialized (even if it's empty)
      const updatedCardBank = prevData.cardBank || [];

      selectedActions.forEach((action) => {
        const existingActionIndex = updatedCardBank.findIndex(
          (card) => card.id === action.id
        );

        if (existingActionIndex !== -1) {
          // If the action already exists, increment its quantity
          updatedCardBank[existingActionIndex].quantity += 1;
        } else {
          // If the action doesn't exist, add it with quantity 1
          updatedCardBank.push({ ...action, quantity: 1 });
        }
      });

      // Return the updated playerData, ensuring to update only the cardBank
      return {
        ...prevData,
        cardBank: updatedCardBank,
      };
    });

    // Set a timer for when the animation is complete (15 seconds)
    setTimeout(() => {
      setAnimationComplete(true); // Set animationComplete to true after 15 seconds
    }, 15000); // 15 seconds (adjust to match your animation duration)
  };

  // Add the test card to the player's cardBank
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

      // Ensure cardBank is initialized
      const updatedCardBank = prevData.cardBank || [];

      const existingActionIndex = updatedCardBank.findIndex(
        (card) => card.id === testCard.id
      );

      if (existingActionIndex !== -1) {
        // If the action already exists, increment its quantity
        updatedCardBank[existingActionIndex].quantity += 1;
      } else {
        // Add the test card if it doesn't exist
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
        <div className="pack-selection">
          <Button
            text={"Low Tier Pack"}
            onClick={() => handleOpenPack("low")}
          />
          <Button
            text={"Medium Tier Pack"}
            onClick={() => handleOpenPack("medium")}
          />
          <Button
            text={"High Tier Pack"}
            onClick={() => handleOpenPack("high")}
          />
          <Button
            text={"Weapon Pack"}
            onClick={() => handleOpenPack("medium", "weapon")}
          />
          {/* Add a button to add the test card */}
          <Button text={"Add Test Weapon Card"} onClick={handleAddTestCard} />
        </div>
      )}

      {/* Show opened pack details after opening */}
      {packOpened && (
        <div>
          <div className={`pack ${opened ? "opened" : ""}`}>
            {packOpened.map((action, index) => (
              <div
                key={index}
                className={`available-actions-action card-${index + 1}`}
                style={{ animationDelay: `${(index + 1) * 3}s` }} // Apply dynamic delay
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

      {/* Only show the "Home" button after animation is complete */}
      <Button
        text={"Home"}
        onClick={handleContinue}
        disabled={!animationComplete}
      />
    </div>
  );
};

export default OpenPack;
