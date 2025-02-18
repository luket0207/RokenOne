import React, { useState, useEffect, useContext } from "react";
import Button from "../../Components/Button/Button";
import "./SteppingStones.scss";
import Reward from "../../Components/Reward/Reward";

const SteppingStones = () => {
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const initialStones = 4; // Each row starts with 4 stones

  // Define the number of safe stones per row
  const safeStonesPerRow = [3, 2, 2, 1];

  const totalRows = safeStonesPerRow.length;

  // Component state
  const [currentRow, setCurrentRow] = useState(0);
  const [numStones, setNumStones] = useState(initialStones);
  const [safeStones, setSafeStones] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("");
  const [animating, setAnimating] = useState(false); // New state for animation
  const [clickedStoneIndex, setClickedStoneIndex] = useState(null); // Track clicked stone index
  const [stoneStatus, setStoneStatus] = useState(""); // Track if stone is "safe" or "sank"
  const [isLoss, setIsLoss] = useState(false);
  const getSafeStoneCount = (row) => safeStonesPerRow[row];

  // When the current row or number of stones changes, choose random safe stones.
  useEffect(() => {
    if (!gameOver && currentRow < totalRows) {
      const safeStoneCount = getSafeStoneCount(currentRow);
      let safe = [];
      while (safe.length < safeStoneCount) {
        const randomStone = Math.floor(Math.random() * numStones);
        if (!safe.includes(randomStone)) {
          safe.push(randomStone);
        }
      }
      setSafeStones(safe);
      console.log(
        `Row ${currentRow + 1} - Safe stones are:`,
        safe.map((stone) => `Stone ${stone + 1}`).join(", ")
      );
    }
  }, [currentRow, numStones, gameOver]);

  const handleStoneClick = (index) => {
    if (gameOver || animating) return; // Prevent interaction during animation

    setClickedStoneIndex(index); // Track which stone was clicked
    setAnimating(true); // Set animating state to true when stone is clicked

    if (safeStones.includes(index)) {
      setStoneStatus("safe"); // Set status to safe if the stone is a safe stone
    } else {
      setStoneStatus("sank"); // Set status to sank if the stone is not safe
    }

    setTimeout(() => {
      if (safeStones.includes(index)) {
        if (currentRow + 1 >= totalRows) {
          setResult("You safely crossed all the stepping stones! You win!");
          setGameOver(true);
        } else {
          setCurrentRow(currentRow + 1);
        }
      } else {
        setResult("The stone sank under you. You lose!");
        setIsLoss(true);
        setGameOver(true);
      }

      setAnimating(false); // Remove animating class after 2 seconds
      setClickedStoneIndex(null); // Reset clicked stone after animation
      setStoneStatus(""); // Reset stone status after animation
    }, 2000);
  };

  const getRewards = () => {
    setIsRewardOpen(true);
  };

  return (
    <div className="stepping-stones">
      
      <h1>Stepping Stones</h1>

      {!gameOver && (
        <>
          <p>
            Row: {currentRow + 1} of {totalRows}
          </p>
          <p>Select the safe stone(s) to move forward.</p>
          <div className="stones-row">
            {Array.from({ length: numStones }).map((_, index) => (
              <div
                key={index}
                onClick={() => handleStoneClick(index)}
                className={`stones-row-stone ${
                  animating
                    ? stoneStatus === "safe"
                      ? "animation-safe" // Apply animation-safe to all stones if the stone is safe
                      : clickedStoneIndex === index
                      ? "animation-sank" // Apply animation-sank only to the clicked stone if it sank
                      : ""
                    : ""
                }`}
              >

              </div>
            ))}
          </div>
          <div className="river" ></div>
        </>
      )}

      {gameOver && (
        <>
          <h2 className={result.includes("win") ? "result-win" : "result-lose"}>
            {result}
          </h2>
          <Button text={isLoss ? "Continue" : "Get Rewards"} onClick={getRewards} />
        </>
      )}
      
      <Reward
          modalOpen={isRewardOpen}
          setModalOpen={setIsRewardOpen}
          presetReward={null}
          items={1}
          type={["coins", "dust", "talisman"]}
          isLoss={isLoss}
        />
    </div>
  );
};

export default SteppingStones;
