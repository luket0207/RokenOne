import React, { useContext, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { GameDataContext } from "./Data/GameDataContext/GameDataContext"; // Import the context
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCoins,
  faCubesStacked,
  faFloppyDisk,
  faGem,
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
import SteppingStones from "./Scenes/SteppingStones/SteppingStones";
import Talisman from "./Components/Talisman/Talisman";
import Button from "./Components/Button/Button";

const AppRoutes = () => {
  const { expeditionData, playerTeam, playerData, talismans } =
    useContext(GameDataContext);
  const [showDust, setShowDust] = useState(false);
  const location = useLocation();
  const [showAllTalismans, setShowAllTalismans] = useState(false);
  const [showAllTokens, setShowAllTokens] = useState(false);

  const handleSaveGame = () => {
    try {
      // Convert to JSON strings
      const expeditionDataJSON = JSON.stringify(expeditionData);
      const playerTeamJSON = JSON.stringify(playerTeam);
      const playerDataJSON = JSON.stringify(playerData);
      const talismansJSON = JSON.stringify(talismans);

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
      const base64Talismans = btoa(unescape(encodeURIComponent(talismansJSON)));

      // Create a Blob with the base64 encoded data
      const blob = new Blob(
        [
          base64ExpeditionData,
          "\n",
          base64PlayerTeam,
          "\n",
          base64PlayerData,
          "\n",
          base64Talismans,
        ],
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

  // Routes where the game-menu should not be displayed
  const hideMenuRoutes = ["/", "/battle", "/help"];

  return (
    <div className="game-container">
      {/* Conditionally render the game-menu */}
      {!hideMenuRoutes.includes(location.pathname) && (
        <>
          {(talismans[0].talismansBank.length > 0 ||
            playerData[0].packTokens.length > 0) && (
            <div className="talismans-and-tokens">
              {/* Talismans Section */}
              {talismans[0].talismansBank.length > 0 && (
                <div className="talismans">
                  <p className="headers">Talismans</p>
                  <div className="talismans-list">
                    <div className="talismans-list-container">
                      {/* Show first 4 Talismans */}
                      {talismans[0].talismansBank
                        .slice(0, 4)
                        .map((talisman, index) => (
                          <Talisman key={index} talisman={talisman} />
                        ))}

                      {/* Always show the 5th talisman if exactly 5 exist */}
                      {!showAllTalismans &&
                        talismans[0].talismansBank.length === 5 && (
                          <Talisman
                            key={4}
                            talisman={talismans[0].talismansBank[4]}
                          />
                        )}

                      {/* Show More / Show Less Button */}
                      {talismans[0].talismansBank.length > 5 && (
                        <Button
                          className="view-more-btn"
                          onClick={() => setShowAllTalismans((prev) => !prev)}
                          text={
                            showAllTalismans
                              ? "Show Less"
                              : `+${talismans[0].talismansBank.length - 4} More`
                          }
                          type="small"
                        />
                      )}
                    </div>

                    {/* Overflowed Talismans */}
                    <div
                      className={`overflow-talismans ${
                        showAllTalismans ? "" : "hidden"
                      }`}
                    >
                      {talismans[0].talismansBank
                        .slice(4)
                        .map((talisman, index) => (
                          <Talisman key={index + 4} talisman={talisman} />
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens Section */}
              {playerData[0].packTokens.length > 0 && (
                <div className="tokens">
                  <p className="headers">Tokens</p>
                  <div className="tokens-list">
                    <div className="tokens-list-container">
                      {/* Sort Tokens: Highest Discount First, Then Type */}
                      {playerData[0].packTokens
                        .slice() // Avoid state mutation
                        .slice(0, 4) // Show first 4
                        .map((token, index) => (
                          <div
                            key={index}
                            className={`token-item ${token.type.toLowerCase()}`}
                          >
                            {token.quantity > 1 && (
                              <p className="quantity">{token.quantity}</p>
                            )}
                            <FontAwesomeIcon icon={faGem} />
                            <p className="discount">-{token.discount}%</p>
                          </div>
                        ))}

                      {/* Always show the 5th token if exactly 5 exist */}
                      {!showAllTokens &&
                        playerData[0].packTokens.length === 5 && (
                          <div
                            key={4}
                            className={`token-item ${playerData[0].packTokens[4].type.toLowerCase()}`}
                          >
                            {playerData[0].packTokens[4] && (
                              <p className="quantity">
                                {playerData[0].packTokens[4].quantity}
                              </p>
                            )}
                            <FontAwesomeIcon icon={faGem} />
                            <p className="discount">
                              -{playerData[0].packTokens[4].discount}%
                            </p>
                          </div>
                        )}

                      {/* Show More / Show Less Button */}
                      {playerData[0].packTokens.length > 5 && (
                        <Button
                          className="view-more-btn"
                          onClick={() => setShowAllTokens((prev) => !prev)}
                          text={
                            showAllTokens
                              ? "Show Less"
                              : `+${playerData[0].packTokens.length - 4} More`
                          }
                          type="small"
                        />
                      )}
                    </div>

                    {/* Overflowed Tokens */}
                    <div
                      className={`overflow-tokens ${
                        showAllTokens ? "" : "hidden"
                      }`}
                    >
                      {playerData[0].packTokens
                        .slice(4) // Show remaining tokens in overflow div
                        .map((token, index) => (
                          <div
                            key={index + 3}
                            className={`token-item ${token.type.toLowerCase()}`}
                          >
                            {token.quantity > 1 && (
                              <p className="quantity">{token.quantity}</p>
                            )}
                            <FontAwesomeIcon icon={faGem} />
                            <p className="discount">-{token.discount}%</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="game-menu">
            <p className="save-text">Save</p>
            <div className="save-game" onClick={handleSaveGame}>
              <FontAwesomeIcon icon={faFloppyDisk} />
            </div>
            <div className="level">
              <p>Level</p>
              <p>{playerData[0].level}</p>
            </div>
            <div className="coins">
              <p>Coins</p>

              <p>
                <FontAwesomeIcon icon={faCoins} /> {playerData[0].coins}
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
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustRoken}
                </p>
              </div>
              <div className="dust-samurai">
                <p>Samurai</p>
                <p>
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustSamurai}
                </p>
              </div>
              <div className="dust-oyoroi">
                <p>O-Yoroi</p>
                <p>
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustOyoroi}
                </p>
              </div>
              <div className="dust-kobo">
                <p>Kobo</p>
                <p>
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustKobo}
                </p>
              </div>
              <div className="dust-taiko">
                <p>Taiko</p>
                <p>
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustTaiko}
                </p>
              </div>
              <div className="dust-genso">
                <p>Genso</p>
                <p>
                  <FontAwesomeIcon icon={faCubesStacked} />{" "}
                  {playerData[0].dustGenso}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

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
        <Route path="/steppingstones" element={<SteppingStones />} />
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
