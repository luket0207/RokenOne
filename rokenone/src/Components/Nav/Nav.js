import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Nav.scss";

const Nav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className={`nav-container ${isNavOpen ? "open" : "closed"}`}>
      <div className="nav-toggle" onClick={toggleNav}>
        <FontAwesomeIcon icon={isNavOpen ? faTimes : faBars} />
      </div>
      {isNavOpen && (
        <nav>
          <ul>
            <li>
              <Link to="/">Start</Link>
            </li>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/map">Map</Link>
            </li>
            <li>
              <Link to="/timeline">Timeline</Link>
            </li>
            <li>
              <Link to="/battle">Battle</Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Nav;
