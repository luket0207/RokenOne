import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { GameDataProvider } from './Data/GameDataContext/GameDataContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameDataListener from './Data/GameDataListener/GameDataListener';
import "./Assets/Scss/global.scss";

function App() {
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(window.innerWidth < 1295);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenTooSmall(window.innerWidth < 1295);
    };

    window.addEventListener("resize", handleResize);

    // Disable scrolling when the screen is too small
    if (isScreenTooSmall) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = ""; // Reset when component unmounts
    };
  }, [isScreenTooSmall]); // Dependency array ensures effect runs when `isScreenTooSmall` changes

  return (
    <Router>
      <GameDataProvider>
        <GameDataListener>
          <DndProvider backend={HTML5Backend}>
            <div>
              {isScreenTooSmall && (
                <div className="screen-overlay">
                  <p>Zoom out or use a wider screen to play Roken</p>
                </div>
              )}
              <AppRoutes />
            </div>
          </DndProvider>
        </GameDataListener>
      </GameDataProvider>
    </Router>
  );
}

export default App;
