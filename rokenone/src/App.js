import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './AppRoutes';  // Import your routes component
import { GameDataProvider } from './Data/GameDataContext/GameDataContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // Drag-and-drop backend

function App() {
  return (
    <GameDataProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <div>
            <nav>
              <ul>
                <li><Link to="/">Start</Link></li>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/map">Map</Link></li>
                <li><Link to="/timeline">Timeline</Link></li>
                <li><Link to="/battle">Battle</Link></li>
              </ul>
            </nav>
            <AppRoutes />
          </div>
        </Router>
      </DndProvider>
    </GameDataProvider>
  );
}

export default App;
