import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CardBank.scss";
import Button from "../../Components/Button/Button";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import ActionCard from "../../Components/ActionCard/ActionCard";

const CardBank = () => {
  const navigate = useNavigate();
  const { playerData } = useContext(GameDataContext);

  const [sortAttribute, setSortAttribute] = useState("name"); // Default sort by name
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order

  // Define the manaBoost sorting order
  const manaBoostOrder = [
    "black", "grey", "orange", "teal", "gold", "jade", "crimson", "emerald"
  ];

  // Function to compare actions based on the selected sort attribute
  const sortActions = (a, b) => {
    let result = 0;
    switch (sortAttribute) {
      case "name":
        result = a.name.localeCompare(b.name); // Alphabetical sort
        break;
      case "rarity":
        result = a.rarity - b.rarity; // Numerical sort
        break;
      case "class":
        result = a.class.localeCompare(b.class); // Alphabetical sort
        break;
      case "type":
        result = a.type.localeCompare(b.type); // Alphabetical sort
        break;
      case "manaBoost":
        result = manaBoostOrder.indexOf(a.manaBoost) - manaBoostOrder.indexOf(b.manaBoost); // Custom order for manaBoost
        break;
      case "quantity":
        result = a.quantity - b.quantity; // Numerical sort
        break;
      case "id": // Default sort by id
        result = a.id - b.id; // Numerical sort by id
        break;
      default:
        break;
    }
    
    return sortOrder === "asc" ? result : -result; // Toggle sort order
  };

  // Handle navigation to home
  const handleHome = () => {
    navigate("/home");
  };

  // Handle sorting toggle
  const handleSort = (attribute) => {
    if (attribute === sortAttribute) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc")); // Toggle order
    } else {
      setSortAttribute(attribute);
      setSortOrder("asc"); // Default to ascending when switching attribute
    }
  };

  // Reset the sort to default (by id)
  const handleResetSort = () => {
    setSortAttribute("id");
    setSortOrder("asc");
  };

  return (
    <div className="card-bank">
      <h1>Card Bank</h1>
      
      {/* Sorting buttons */}
      <div className="sort-buttons">
        <Button type="small" text="Sort by Name" onClick={() => handleSort("name")} />
        <Button type="small" text="Sort by Rarity" onClick={() => handleSort("rarity")} />
        <Button type="small" text="Sort by Class" onClick={() => handleSort("class")} />
        <Button type="small" text="Sort by Type" onClick={() => handleSort("type")} />
        <Button type="small" text="Sort by Mana Colour" onClick={() => handleSort("manaBoost")} />
        <Button type="small" text="Sort by Quantity" onClick={() => handleSort("quantity")} />
      </div>

      <div className="card-bank-list">
        {/* Ensure playerData.cardBank is an array before attempting to map */}
        {playerData?.cardBank?.length > 0 ? (
          playerData.cardBank.sort(sortActions).map((action, index) => (
            <ActionCard key={index} action={action} noAnimation={true} />
          ))
        ) : (
          <p>No actions in card bank</p> // Fallback message when cardBank is empty
        )}
      </div>

      <Button text={"Home"} onClick={handleHome} />
    </div>
  );
};

export default CardBank;
