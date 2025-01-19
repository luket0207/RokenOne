import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import all your pages
import Start from './Scenes/Start/Start';
import Map from './Scenes/Map/Map';
import Edit from './Scenes/Edit/Edit';
import Battle from './Scenes/Battle/Battle';
import ExpeditionHome from './Scenes/ExpeditionHome/ExpeditionHome';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/expeditionhome" element={<ExpeditionHome />} />
      <Route path="/map" element={<Map />} />
      <Route path="/edit/:characterId" element={<Edit />} />
      <Route path="/battle" element={<Battle />} />
    </Routes>
  );
};

export default AppRoutes;
