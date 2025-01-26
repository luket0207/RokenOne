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
      <h1>Help</h1>
      <h3>Expeditions</h3>
      <p>
        Expeditions are your journey through the game. Generate one and then the
        game will remember it until you complete it or faint. Each day you will
        be offered a choice. That choice is played out then you move on to the
        next day. At the end there will be a boss battle too.
      </p>
      <h3>Cards and Your Card Bank</h3>
      <p>
        Cards contain just actions for now. But in future probably weapons and
        maybe more. When you gain cards, they go into your card bank. You can
        view your card bank from the home screen. You will see what cards you
        have and how many of them cards you have collected in the top right.
      </p>
      <p>Cards have 5 rarities:</p>
      <ul>
        <li>
          Common - Grey <span className="sample grey"></span>
        </li>
        <li>
          Uncommon - Dark Grey <span className="sample dark-grey"></span>
        </li>
        <li>
          Rare - Green <span className="sample green"></span>
        </li>
        <li>
          Epic - Gold <span className="sample gold"></span>
        </li>
        <li>
          Legendary - Purple <span className="sample purple"></span>
        </li>
      </ul>
      <h3>Packs</h3>
      <p>
        Packs have been added. In the game you will need to buy these but for
        now you can just freely open them. Packs give you 4 cards. Packs have
        different tiers meaning higher rarity cards are more common in higher
        tier packs.
      </p>
      <h3>Adding and Upgrading Actions</h3>
      <p>
        When you are in the edit teammate screen, you will see buttons at the
        bottom of each action. These allow you to upgrade an action for that
        character only, if you have enough of the same action in your card bank.
        When you upgrade you spend cards from your card bank
      </p>
      <p>
        You can add new actions to a character by clicking the plus. You will
        spend 1 card from your card bank and the card will be added to that
        character's card pull forever then. You can then upgrade it as normal.
      </p>

      <h3>Your Team and Timelines</h3>
      <p>
        Each player starts with one character in their team, Roken. You can add
        more later but not in this version yet.
      </p>
      <p>
        Each character has their own timeline, this is how they play actions in
        battle. You need to fill the timelines with actions and they will be
        played in the order you put them in.
      </p>
      <p>
        If you are on Expedition Home and it won't let you continue. You should
        see a pulsing red ! on a character. That means you haven't set anything
        in that character's timeline.
      </p>
      <h3>Actions</h3>
      <ul>
        <li>Attack - Deal damage</li>
        <li>Defence - Add defence</li>
        <li>Heal - Heal health</li>
        <li>Charge - Add charge to use your weapon</li>
        <li>
          Illusion - has 3 levels, each level has a different chance of making a
          random enemy miss their action. Level 1: 25% chance, Level 2: 50%,
          Level 3: 75%.
        </li>
        <li>
          Buff - It's there and it works but you can only buff teammates so
          useless right now.{" "}
        </li>
      </ul>
      <h3>Battle Tips</h3>
      <p>
        In the battle you can do two things. You can target enemies by clicking
        on their card. This will make all your characters attack that enemy
        until it is dead.
      </p>
      <p>
        You can also use your weapon if you have the required charge. This will
        be a red circle that appears over the character in the battle. You can
        drag this onto the enemy you wish to deal damage to. It will be dealt at
        the start of the next turn after you let go.
      </p>

      <Button text={"Return Home"} onClick={navigateHome} />
    </div>
  );
};

export default Help;
