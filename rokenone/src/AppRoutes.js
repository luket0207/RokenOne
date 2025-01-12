import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import all your pages
import Start from './Scenes/Start/Start';
import Home from './Scenes/Home/Home';
import Map from './Scenes/Map/Map';
import Timeline from './Scenes/Timeline/Timeline';
import Battle from './Scenes/Battle/Battle';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/home" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/timeline/:characterId" element={<Timeline />} />
      <Route path="/battle" element={<Battle />} />
    </Routes>
  );
};

export default AppRoutes;
