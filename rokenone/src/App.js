import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';  // Import your routes component
import { GameDataProvider } from './Data/GameDataContext/GameDataContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // Drag-and-drop backend
import Nav from './Components/Nav/Nav';
import GameDataListener from './Data/GameDataListener/GameDataListener'; // Import the new listener
import "./Assets/Scss/global.scss";

function App() {
  return (
    <Router>
      <GameDataProvider>
        <GameDataListener>
          <DndProvider backend={HTML5Backend}>
            <div>
              <Nav />
              <AppRoutes />
            </div>
          </DndProvider>
        </GameDataListener>
      </GameDataProvider>
    </Router>
  );
}

export default App;
