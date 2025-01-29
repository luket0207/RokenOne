import React from "react";
import "./ManaIcon.scss";

const ManaIcon = ({ colour }) => {
  return (
    <div className={`mana-icon`}>
      <span class={`mana-icon-image ${colour}`}></span>
    </div>
  );
};

export default ManaIcon;
