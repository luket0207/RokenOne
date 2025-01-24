import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button/Button";
import "./Cave.scss";

const Cave = () => {
  const [playerPosition, setPlayerPosition] = useState(0); // Player's current position in the cave
  const [bearPosition, setBearPosition] = useState(0); // Random bear position
  const [gameOver, setGameOver] = useState(false); // Flag to indicate if the game is over
  const [result, setResult] = useState(""); // Result message
  const variableProximity = 2; // Variable proximity for winning

  const navigate = useNavigate();

  // Initialize bearPosition randomly between 6 and 16 when component mounts
  useEffect(() => {
    const randomBearPosition = Math.floor(Math.random() * 11) + 6;
    setBearPosition(randomBearPosition);
  }, []);

  // Handle the "twist" action
  const handleTwist = () => {
    setPlayerPosition((prevPosition) => {
      const newPosition = prevPosition + 1;

      // Check if the player has reached the bear's position
      if (newPosition >= bearPosition) {
        setResult("You were chased out by a bear!");
        setGameOver(true);
      }

      return newPosition;
    });
  };

  // Handle the "stick" action
  const handleStick = () => {
    if (bearPosition - playerPosition <= variableProximity) {
      setResult("You found loot!");
    } else {
      setResult("You went home empty-handed.");
    }
    setGameOver(true);
  };

  // Navigate back to home
  const goBackHome = () => {
    navigate("/home");
  };

  return (
    <div className="cave-game">
      <h1>Explore the Cave</h1>

      {/* Display current position and bear's position */}
      {!gameOver && (
        <>
          <p>Your position in the cave: {playerPosition}</p>
          <p>How far will you go?</p>
          <Button text="Twist (Go Deeper)" onClick={handleTwist} />
          <Button text="Stick (Stop Here)" onClick={handleStick} />
        </>
      )}

      {/* Display game result when it's over */}
      {gameOver && (
        <>
          <h2>{result}</h2>
          <Button text="Return Home" onClick={goBackHome} />
        </>
      )}
    </div>
  );
};

export default Cave;
