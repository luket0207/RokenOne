import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Reward.scss";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import Modal from "../Modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faCubesStacked,
  faGem,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import talismansData from "../../Data/Talismans/Talismans.json";
import Talisman from "../Talisman/Talisman";

const getRandomValue = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const rewardWeights = {
  coins: 80,
  dust: 40,
  talisman: 40,
  token: 10,
};

const dustTypes = {
  All: [
    "dustRoken",
    "dustSamurai",
    "dustOyoroi",
    "dustKobo",
    "dustTaiko",
    "dustGenso",
  ],
  Roken: "dustRoken",
  Samurai: "dustSamurai",
  Oyoroi: "dustOyoroi",
  Kobo: "dustKobo",
  Taiko: "dustTaiko",
  Genso: "dustGenso",
};

const tokenDiscounts = [
  { discount: 10, weight: 80 },
  { discount: 25, weight: 40 },
  { discount: 50, weight: 10 },
  { discount: 75, weight: 2 },
  { discount: 100, weight: 0.1 },
];

const talismanRarityWeights = [
  { rarity: 0, weight: 70 },
  { rarity: 1, weight: 40 },
  { rarity: 2, weight: 20 },
  { rarity: 3, weight: 10 },
  { rarity: 4, weight: 1 },
];

const getDustType = (expeditionClass) => {
  if (expeditionClass === "All") {
    return dustTypes.All[Math.floor(Math.random() * dustTypes.All.length)];
  }

  if (Math.random() < 0.85) return dustTypes[expeditionClass];

  const otherDusts = dustTypes.All.filter(
    (dust) => dust !== dustTypes[expeditionClass]
  );
  return otherDusts[Math.floor(Math.random() * otherDusts.length)];
};

const getWeightedRarity = () => {
  const totalWeight = talismanRarityWeights.reduce(
    (sum, item) => sum + item.weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const { rarity, weight } of talismanRarityWeights) {
    if (random < weight) return rarity;
    random -= weight;
  }
};

const getRandomTalisman = () => {
  const rarity = getWeightedRarity();
  const filteredTalismans = talismansData.filter(
    (talisman) => talisman.rarity === rarity
  );
  if (filteredTalismans.length === 0) return null;

  return filteredTalismans[
    Math.floor(Math.random() * filteredTalismans.length)
  ];
};

const getTokenType = (expeditionClass) => {
  const chance = Math.random();
  if (chance < 0.1) return "weapon";
  if (chance < 0.2) return "Roken";
  if (expeditionClass !== "All" && chance < 0.7) return expeditionClass;
  return "normal";
};

const getTokenDiscount = () => {
  const totalWeight = tokenDiscounts.reduce(
    (sum, item) => sum + item.weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const { discount, weight } of tokenDiscounts) {
    if (random < weight) return discount;
    random -= weight;
  }
};

const generateReward = (type, level, isBattle, expeditionClass) => {
  switch (type) {
    case "coins": {
      const lowerRange = 5 + level + (isBattle ? 2 : 0);
      const upperRange = lowerRange * 2;
      return { type: "coins", amount: getRandomValue(lowerRange, upperRange) };
    }
    case "dust": {
      const lowerRange = 5 + level + (isBattle ? 2 : 0);
      const upperRange = lowerRange * 2;
      return {
        type: getDustType(expeditionClass),
        amount: getRandomValue(lowerRange, upperRange),
      };
    }
    case "talisman": {
      const chosenTalisman = getRandomTalisman();
      return chosenTalisman
        ? { type: "talisman", talisman: chosenTalisman }
        : null;
    }
    case "token": {
      return {
        type: "token",
        tokenType: getTokenType(expeditionClass),
        discount: getTokenDiscount(),
      };
    }
    default:
      return null;
  }
};

const Reward = ({
  modalOpen,
  setModalOpen,
  presetReward,
  isBattle = false,
  items = 1,
  type = ["coins", "dust", "talisman", "token"], // Allowed types
  isLoss = false,
}) => {
  const {
    playerData,
    expeditionData,
    talismans,
    setTalismans,
    addCurrency,
    setPlayerData,
    moveToNextDay,
  } = useContext(GameDataContext);
  const level = playerData[0].level;
  const expeditionClass = expeditionData[0]?.expedition?.class || "All";

  const [rewards, setRewards] = useState([]);
  const [pendingTalisman, setPendingTalisman] = useState(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (modalOpen) {
      if (isLoss) {
        return
      } else if (presetReward && presetReward.length > 0) {
        console.log(presetReward);
        setRewards((prevRewards) => {
          if (prevRewards.length > 0) return prevRewards; // Prevent unnecessary updates

          return presetReward
            .map(([type, amountOrId]) => {
              if (type === "coins") {
                return { type: "coins", amount: amountOrId };
              } else if (type === "talisman") {
                if (!talismans || talismans.length === 0) return null; // Prevent infinite loop if talismans is empty
                console.log(talismansData);
                const foundTalisman = talismansData.find(
                  (t) => String(t.id) === String(amountOrId)
                );
                console.log(
                  "Searching for:",
                  amountOrId,
                  "Found:",
                  foundTalisman
                );

                return foundTalisman
                  ? { type: "talisman", talisman: foundTalisman }
                  : null;
              }
              return null;
            })
            .filter(Boolean); // Remove null values
        });
      } else {
        const filteredRewardWeights = Object.keys(rewardWeights)
          .filter((key) => type.includes(key))
          .reduce((acc, key) => {
            acc[key] = rewardWeights[key];
            return acc;
          }, {});

        const getWeightedRandom = (weights) => {
          const totalWeight = Object.values(weights).reduce(
            (sum, weight) => sum + weight,
            0
          );
          let random = Math.random() * totalWeight;
          for (const [key, weight] of Object.entries(weights)) {
            if (random < weight) return key;
            random -= weight;
          }
        };

        const uniqueTypes = new Set();
        while (uniqueTypes.size < items) {
          uniqueTypes.add(getWeightedRandom(filteredRewardWeights));
        }

        const shuffledTypes = Array.from(uniqueTypes);
        const generatedRewards = shuffledTypes.map((rewardType) => {
          const reward = generateReward(
            rewardType,
            level,
            isBattle,
            expeditionClass
          );
          const talismanBank = talismans[0]?.talismansBank || [];
          const maxTalismans = talismans[0]?.maxTalismansBank || 0;
          if (
            rewardType === "talisman" &&
            talismanBank.length >= maxTalismans
          ) {
            setPendingTalisman(reward.talisman);
          }
          return reward;
        });
        setRewards(generatedRewards);
      }
    }
  }, [modalOpen, presetReward, items, expeditionClass, level, type, talismans]);

  const handleClose = () => {
    const talismanBank = talismans[0].talismansBank;
    const maxTalismans = talismans[0].maxTalismansBank;
    const isTalismanBankFull = talismanBank.length >= maxTalismans;

    setModalOpen(false);
    let hasPendingTalisman = false;

    rewards.forEach((reward) => {
      if (reward.type === "coins") {
        addCurrency("coins", reward.amount);
      } else if (reward.type.startsWith("dust")) {
        addCurrency(reward.type, reward.amount);
      } else if (reward.type === "talisman") {
        if (!isTalismanBankFull) {
          setTalismans((prevTalismans) => [
            {
              ...prevTalismans[0],
              talismansBank: [...talismanBank, reward.talisman],
            },
          ]);
        } else {
          hasPendingTalisman = true;
        }
      } else if (reward.type === "token") {
        setPlayerData((prevData) => {
          const updatedTokens = [...prevData[0].packTokens];
          const existingTokenIndex = updatedTokens.findIndex(
            (token) =>
              token.type.toLowerCase() === reward.tokenType.toLowerCase() &&
              token.discount === reward.discount
          );

          if (existingTokenIndex !== -1) {
            // If token exists, increase its quantity
            updatedTokens[existingTokenIndex].quantity += 1;
          } else {
            // If token does not exist, add it with quantity: 1
            updatedTokens.push({
              type: reward.tokenType.toLowerCase(),
              discount: reward.discount,
              quantity: 1,
            });
          }

          // Define the correct type order
          const typeOrder = [
            "normal",
            "roken",
            "samurai",
            "oyoroi",
            "kobo",
            "taiko",
            "genso",
            "weapon",
          ];

          // Sort tokens first by discount (highest first), then by type order
          updatedTokens.sort((a, b) => {
            if (b.discount !== a.discount) return b.discount - a.discount;
            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
          });

          return [
            {
              ...prevData[0],
              packTokens: updatedTokens,
            },
          ];
        });
      }
    });
    moveToNextDay();
    navigate("/expeditionhome");
  };

  const handleTalismanDecision = (keepNew, talismanToReplaceIndex) => {
    if (keepNew && talismanToReplaceIndex !== null) {
      setTalismans((prevTalismans) => {
        const updatedTalismans = [...prevTalismans[0].talismansBank];
        updatedTalismans[talismanToReplaceIndex] = pendingTalisman;
        return [{ ...prevTalismans[0], talismansBank: updatedTalismans }];
      });
    }
    setPendingTalisman(null);
    setReplaceIndex(null);
    handleClose();
  };

  return (
    <Modal isOpen={modalOpen} onClose={handleClose}>
      <div className="reward-container">
        <h2>Reward</h2>
        {rewards.length > 0 ? (
          <div className="reward-list">
            {rewards.map((reward, index) => (
              <div key={index} className="reward-list-item">
                {reward.type === "coins" && (
                  <>
                    <FontAwesomeIcon icon={faCoins} className="coins" />
                    <p>{reward.amount}</p>
                  </>
                )}
                {reward.type.startsWith("dust") && (
                  <>
                    <FontAwesomeIcon
                      icon={faCubesStacked}
                      className={reward.type}
                    />
                    <p>{reward.amount}</p>
                  </>
                )}
                {reward.type === "talisman" && (
                  <>
                    <Talisman talisman={reward.talisman} />
                  </>
                )}
                {reward.type === "token" && (
                  <div
                    key={index}
                    className={`token-item ${reward.tokenType.toLowerCase()}`}
                  >
                    {reward.quantity > 1 && (
                      <p className="quantity">{reward.quantity}</p>
                    )}
                    <FontAwesomeIcon icon={faGem} />
                    <p className="discount">-{reward.discount}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You didn't get any rewards this time.</p>
        )}

        {pendingTalisman ? (
          <>
            {rewards.map((reward, index) => (
              <>
                {reward.type === "talisman" && (
                  <>
                    {pendingTalisman && (
                      <div className="talisman-overflow">
                        <p className="talisman-overflow-alert">
                          {" "}
                          <FontAwesomeIcon icon={faTriangleExclamation} />
                          Talisman Bank Full.
                          <FontAwesomeIcon icon={faTriangleExclamation} />
                        </p>
                        <Button
                          text={`Discard ${pendingTalisman.name}`}
                          type="small"
                          onClick={() => handleTalismanDecision(false)}
                        />
                        <h4>Or Select a talisman to replace:</h4>
                        <div className="replace-list">
                          {talismans[0].talismansBank.map((t, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleTalismanDecision(true, idx)}
                              className="replace-list-talisman"
                            >
                              <Talisman talisman={t} noDescription />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ))}
          </>
        ) : (
          <div className="reward-button">
            <Button text={"Next Day"} onClick={handleClose} type="secondary" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Reward;
