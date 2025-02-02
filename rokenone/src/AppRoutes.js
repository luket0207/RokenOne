import React, { useContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { GameDataContext } from "./Data/GameDataContext/GameDataContext"; // Import the context
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCoins,
  faCubesStacked,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";

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
import EditTeam from "./Scenes/EditTeam/EditTeam";
import OpenPack from "./Scenes/OpenPack/OpenPack";
import CardBank from "./Scenes/CardBank/CardBank";

const AppRoutes = () => {
  const { expeditionData, playerTeam, playerData } =
    useContext(GameDataContext);
  const [gameData, setGameData] = useState(playerData[0]);
  const [showDust, setShowDust] = useState(false);

  const handleSaveGame = () => {
    try {
      // Convert to JSON strings
      const expeditionDataJSON = JSON.stringify(expeditionData);
      const playerTeamJSON = JSON.stringify(playerTeam);
      const playerDataJSON = JSON.stringify(playerData);

      // Convert JSON strings to UTF-8 bytes and then base64 encode them
      const base64ExpeditionData = btoa(
        unescape(encodeURIComponent(expeditionDataJSON))
      );
      const base64PlayerTeam = btoa(
        unescape(encodeURIComponent(playerTeamJSON))
      );
      const base64PlayerData = btoa(
        unescape(encodeURIComponent(playerDataJSON))
      );

      // Create a Blob with the base64 encoded data
      const blob = new Blob(
        [base64ExpeditionData, "\n", base64PlayerTeam, "\n", base64PlayerData],
        {
          type: "text/plain;charset=utf-8",
        }
      );

      // Create a download link for the save file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "roken-save-game.txt";
      link.click();
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  const handleToggleShowDust = () => {
    setShowDust(!showDust);
  };

  return (
    <div className="game-container">
      {/* Save Game Button */}
      <div className="game-menu">
        <p className="save-text">Save</p>
        <div className="save-game" onClick={handleSaveGame}>
          <FontAwesomeIcon icon={faFloppyDisk} />
        </div>
        <div className="level">
          <p>Level</p>
          <p>{gameData.level}</p>
        </div>
        <div className="coins">
          <p>Coins</p>

          <p>
            <FontAwesomeIcon icon={faCoins} /> {gameData.coins}
          </p>
        </div>
        <div className="dust-toggle" onClick={handleToggleShowDust}>
          <p>Dust</p>
          <FontAwesomeIcon icon={faCubesStacked} />
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
        <div className={`dust ${showDust ? "show-dust" : ""}`}>
          <div className="dust-roken">
            <p>Roken</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustRoken}
            </p>
          </div>
          <div className="dust-samurai">
            <p>Samurai</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustSamurai}
            </p>
          </div>
          <div className="dust-oyoroi">
            <p>O-Yoroi</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustOyoroi}
            </p>
          </div>
          <div className="dust-kobo">
            <p>Kobo</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustKobo}
            </p>
          </div>
          <div className="dust-taiko">
            <p>Taiko</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustTaiko}
            </p>
          </div>
          <div className="dust-genso">
            <p>Genso</p>
            <p>
              <FontAwesomeIcon icon={faCubesStacked} /> {gameData.dustGenso}
            </p>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/home" element={<Home />} />
        <Route path="/loot" element={<Loot />} />
        <Route path="/izakaya" element={<Izakaya />} />
        <Route path="/expeditionchoice" element={<ExpeditionChoice />} />
        <Route path="/expeditionhome" element={<ExpeditionHome />} />
        <Route path="/expeditionmap" element={<ExpeditionMap />} />
        <Route path="/edit/:navString/:characterId" element={<Edit />} />
        <Route path="/editteam" element={<EditTeam />} />
        <Route path="/codebreaker" element={<CodeBreaker />} />
        <Route path="/cave" element={<Cave />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/help" element={<Help />} />
        <Route path="/easteregg" element={<EasterEgg />} />
        <Route path="/openpack" element={<OpenPack />} />
        <Route path="/cardbank" element={<CardBank />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
