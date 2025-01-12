import React, { useContext } from 'react';
import { GameDataContext } from '../../Data/GameDataContext/GameDataContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { playerTeam } = useContext(GameDataContext);

  return (
    <div>
      <h1>Your Team</h1>
      <ul>
        {playerTeam.map((character) => (
          <li key={character.id}>
            <Link to={`/timeline/${character.id}`}>
              {character.name} - Health: {character.health}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
