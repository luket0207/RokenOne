import React from "react";
import "./Button.scss";

const Button = ({ text, onClick, type = "primary", disabled = false }) => {
  return (
    <div
      className={`btn btn-${type} ${disabled ? "btn-disabled" : ""}`}
      onClick={!disabled ? onClick : null} // Disable click if disabled is true
    >
      {text}
    </div>
  );
};

export default Button;
