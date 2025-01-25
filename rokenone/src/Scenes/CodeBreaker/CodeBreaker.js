import React, { useState, useEffect, useContext } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAppleAlt,
  faAnchor,
  faBell,
  faBolt,
  faDragon,
  faFeather,
  faFish,
  faGhost,
} from "@fortawesome/free-solid-svg-icons"; // Example icons
import "./CodeBreaker.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";

const CodeBreaker = ({ codeLength = 8, chances = 4 }) => {
  const [hiddenCode, setHiddenCode] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("Take a guess");
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const navigate = useNavigate();
  const { moveToNextDay } = useContext(GameDataContext);

  const numberToIconMap = {
    1: faAppleAlt,
    2: faAnchor,
    3: faBell,
    4: faBolt,
    5: faDragon,
    6: faFeather,
    7: faFish,
    8: faGhost,
  };

  const generateRandomCode = () => {
    const numbers = Array.from({ length: codeLength }, (_, index) => index + 1);
    const shuffled = numbers.sort(() => 0.5 - Math.random());
    return shuffled;
  };

  useEffect(() => {
    const randomCode = generateRandomCode();
    setHiddenCode(randomCode);
  }, [codeLength]);

  const handleGuess = (playerGuess) => {
    if (attempts >= chances) {
      setMessage("No more attempts left!");
      setIsGameOver(true);
      return;
    }

    let correctPosition = [];
    for (let i = 0; i < hiddenCode.length; i++) {
      if (playerGuess[i] === hiddenCode[i]) {
        correctPosition[i] = true;
      } else {
        correctPosition[i] = false;
      }
    }

    const updatedGuesses = [
      ...guesses,
      { guess: playerGuess, correctPosition },
    ];
    setGuesses(updatedGuesses);
    setAttempts(attempts + 1);

    if (correctPosition.every((isCorrect) => isCorrect)) {
      setIsCorrectGuess(true);
      setIsGameOver(true);
      setMessage(
        <span>
          Congratulations! You guessed the correct order:{" "}
          {hiddenCode.map((num, i) => (
            <span className="icon-in-text">
              <FontAwesomeIcon key={i} icon={numberToIconMap[num]} />
            </span>
          ))}
        </span>
      );
    } else if (attempts + 1 === chances) {
      setIsGameOver(true);
      setMessage(
        <span>
          Game over! The correct order was:{" "}
          {hiddenCode.map((num, i) => (
            <span className="icon-in-text">
              <FontAwesomeIcon key={i} icon={numberToIconMap[num]} />
            </span>
          ))}
        </span>
      );
    } else {
      setMessage("Symbols in the correct location are highlighted in green.");
    }
  };

  const navigateToHome = () => {
    moveToNextDay();
    navigate("/expeditionhome");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="code-breaker">
        <div className="code-breaker-text">
          <h1>CodeBreaker Mini-Game</h1>
          <p>Guess the correct order of symbols! You have {chances} chances.</p>
        </div>
        <div className="code-breaker-game">
          <GuessInput
            handleGuess={handleGuess}
            disabled={attempts >= chances || isCorrectGuess}
            codeLength={codeLength}
            numberToIconMap={numberToIconMap}
          />
          <h3 className="message">{message}</h3>

          <div className="guesses">
            {guesses.map((guessData, index) => (
              <p key={index}>
                {guessData.guess.map((number, i) => (
                  <span
                    key={i}
                    className={`guess ${
                      guessData.correctPosition[i] ? "correct" : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={numberToIconMap[number]} size="1x" />
                  </span>
                ))}
              </p>
            ))}
          </div>

          {isGameOver && (
            <Button text="Go to Expedition Home" onClick={navigateToHome} />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

const GuessInput = ({ handleGuess, disabled, codeLength, numberToIconMap }) => {
  const [guess, setGuess] = useState(
    Array.from({ length: codeLength }, (_, index) => index + 1)
  );

  // Function to swap numbers when they are dragged
  const moveNumber = (fromIndex, toIndex) => {
    const updatedGuess = [...guess];

    // Swap the two icons' positions when the drop happens
    [updatedGuess[fromIndex], updatedGuess[toIndex]] = [
      updatedGuess[toIndex],
      updatedGuess[fromIndex],
    ];

    setGuess(updatedGuess); // Update the state of the guess
  };

  // Submit guess
  const submitGuess = () => {
    handleGuess(guess);
  };

  return (
    <div className="guess-input">
      <h3>Reorder Your Guess:</h3>
      <div className="number-list">
        {guess.map((number, index) => (
          <DroppableSlot
            key={index}
            number={number}
            index={index}
            moveNumber={moveNumber} // Pass down moveNumber to the DroppableSlot
            numberToIconMap={numberToIconMap}
          />
        ))}
      </div>
      <Button text={"Submit Guess"} onClick={submitGuess} disabled={disabled} />
    </div>
  );
};

// Draggable number icon component
const DraggableIcon = ({ number, index, numberToIconMap }) => {
  const [, drag] = useDrag({
    type: "NUMBER",
    item: { index }, // Only passing the index of the dragged item
  });

  return (
    <div ref={drag} className="number-icon">
      <FontAwesomeIcon icon={numberToIconMap[number]} />
    </div>
  );
};

// Droppable slot for arranging guess order
const DroppableSlot = ({ number, index, moveNumber, numberToIconMap }) => {
  const [, drop] = useDrop({
    accept: "NUMBER",
    drop: (item) => {
      if (item.index !== index) {
        moveNumber(item.index, index); // Perform swap when dropped
      }
    },
  });

  return (
    <div ref={drop} className="drop-slot">
      {number ? (
        <DraggableIcon
          number={number}
          index={index}
          numberToIconMap={numberToIconMap}
        />
      ) : null}
    </div>
  );
};

export default CodeBreaker;
