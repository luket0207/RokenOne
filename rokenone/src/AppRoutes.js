import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { GameDataContext } from "./Data/GameDataContext/GameDataContext"; // Import the context
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

// Import all your pages
import Start from "./Scenes/Start/Start";
import ExpeditionMap from "./Scenes/ExpeditionMap/ExpeditionMap";
import Edit from "./Scenes/Edit/Edit";
import CodeBreaker from "./Scenes/CodeBreaker/CodeBreaker";
import Battle from "./Scenes/Battle/Battle";
import ExpeditionHome from "./Scenes/ExpeditionHome/ExpeditionHome";
import ExpeditionChoice from "./Scenes/ExpeditionChoice/ExpeditionChoice";
import Home from "./Scenes/Home/Home";
import Cave from "./Scenes/Cave/Cave";
import Loot from "./Scenes/Loot/Loot";
import Izakaya from "./Scenes/Izakaya/Izakaya";
import Help from "./Scenes/Help/Help";
import EasterEgg from "./Scenes/EasterEgg/EasterEgg";

const AppRoutes = () => {
  const { expeditionData, playerTeam } = useContext(GameDataContext);

  const handleSaveGame = () => {
    try {
      // Convert to JSON strings
      const expeditionDataJSON = JSON.stringify(expeditionData);
      const playerTeamJSON = JSON.stringify(playerTeam);

      // Convert JSON strings to UTF-8 bytes and then base64 encode them
      const base64ExpeditionData = btoa(
        unescape(encodeURIComponent(expeditionDataJSON))
      );
      const base64PlayerTeam = btoa(
        unescape(encodeURIComponent(playerTeamJSON))
      );

      // Create a Blob with the base64 encoded data
      const blob = new Blob([base64ExpeditionData, "\n", base64PlayerTeam], {
        type: "text/plain;charset=utf-8",
      });

      // Create a download link for the save file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "roken-save-game.txt";
      link.click();
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  return (
    <div>
      {/* Save Game Button */}
      <div className="save-game" onClick={handleSaveGame}>
        <FontAwesomeIcon icon={faFloppyDisk} size="2x" />
      </div>

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
        <Route path="/easteregg" element={<EasterEgg />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
