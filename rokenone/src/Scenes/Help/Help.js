import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button/Button";
import "./Help.scss";

const Help = () => {
  const navigate = useNavigate();

  const navigateHome = () => {
    navigate("/home");
  };
  return (
    <div className="help">
      <h1>How to Play</h1>

      <h3>1. Open Some Packs</h3>
      <p>You won’t win without new actions. It’s not balanced yet.</p>
      <p>
        There is also a <strong>free weapon</strong> if you look at the very
        bottom of the pack page.
      </p>

      <h3>2. (Optional) Edit Your Team</h3>
      <p>You can add another teammate if you want. To do this, go to the edit team page from the home screen. You can also edit timelines from this page too.</p>
      <p>
        Tadashi is a Samurai class (red cards)
        and Kiyoshi is a Oyoroi class (blue
        cards).
      </p>
      <p>It's important to note that this is disabled when an expedition is ongoing. You can only edit your team when there isn't an expedition happening.</p>

      <h3>3. Start an Expedition</h3>
      <p>
        Use the first two easy options when you are chosing an expedition. The medium option was for testing harder
        difficulties and I think I left it on really difficult.
      </p>

      <h3>4. Edit Your Players' Timelines</h3>
      <ul>
        <li>
          You need to add actions to <strong>Roken</strong> and any other
          teammates you’ve chosen.
        </li>
        <li>
          To add the actions you’ve pulled from packs, click on the{" "}
          <strong>plus (+)</strong> icon.
        </li>
        <li>If a card is available for that class, it will appear.</li>
      </ul>

      <h3>5. (Optional) Set a Weapon</h3>
      <p>
        Weapons aren’t fully finished, but you should{" "}
        <strong>add one for now</strong> and it will be fine.
      </p>
      <p>
        They functionally work, but the selection process around them is still a
        bit weird.
      </p>

      <h3>6. Go Back & Start the Game</h3>
      <p>
        Return to the <strong>Expedition Home</strong> and start a game. You
        should be able to work it out from there!
      </p>

      <Button text={"Return Home"} onClick={navigateHome} />
    </div>
  );
};

export default Help;
