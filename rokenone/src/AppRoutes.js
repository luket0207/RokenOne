import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import all your pages
import Start from './Scenes/Start/Start';
import ExpeditionMap from './Scenes/ExpeditionMap/ExpeditionMap';
import Edit from './Scenes/Edit/Edit';
import CodeBreaker from './Scenes/CodeBreaker/CodeBreaker';
import Battle from './Scenes/Battle/Battle';
import ExpeditionHome from './Scenes/ExpeditionHome/ExpeditionHome';
import ExpeditionChoice from './Scenes/ExpeditionChoice/ExpeditionChoice';
import Home from './Scenes/Home/Home';
import Cave from './Scenes/Cave/Cave';
import Loot from './Scenes/Loot/Loot';
import Izakaya from './Scenes/Izakaya/Izakaya';
import Help from './Scenes/Help/Help';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/home" element={<Home />} />
      <Route path="/loot" element={<Loot />} />
      <Route path="/izakaya" element={<Izakaya />} />
      <Route path="/expeditionchoice" element={<ExpeditionChoice />} />
      <Route path="/expeditionhome" element={<ExpeditionHome />} />
      <Route path="/expeditionmap" element={<ExpeditionMap />} />
      <Route path="/edit/:characterId" element={<Edit />} />
      <Route path="/codebreaker" element={<CodeBreaker />} />
      <Route path="/cave" element={<Cave />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  );
};

export default AppRoutes;
