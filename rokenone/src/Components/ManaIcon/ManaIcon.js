import React from "react";
import "./ManaIcon.scss";

const ManaIcon = ({ colour }) => {
  return (
    <div className={`mana-icon`}>
      <span className={`mana-icon-image ${colour}`}></span>
    </div>
  );
};

export default ManaIcon;
