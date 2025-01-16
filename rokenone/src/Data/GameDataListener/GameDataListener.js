import React, { useEffect, useContext } from 'react';
import { GameDataContext } from '../GameDataContext/GameDataContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GameDataListener = ({ children }) => {
  const { playerTeam } = useContext(GameDataContext); // Get playerTeam from context
  const navigate = useNavigate(); // useNavigate hook
  const location = useLocation(); // useLocation hook to get the current route

  // Effect to check if there is only one player and redirect if it's Roken
  useEffect(() => {
    // Only redirect if we're not already on the /start page
    if (playerTeam.length === 1 && playerTeam[0].name === 'Roken' && location.pathname !== '/') {
      navigate('/'); // Redirect to the start page
    }
  }, [playerTeam, navigate, location]);

  return children; // Render the children (GameDataProvider)
};

export default GameDataListener;
