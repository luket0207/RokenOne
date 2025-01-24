import "./ChargeBar.scss"; // Make sure the styles are correct

const ChargeBar = ({ charge, isPlayerTeam }) => {
  const circles = [];

  for (let i = 1; i <= 9; i++) {
    circles.push(
      <div
        key={i}
        className={`charge-bar-circle charge-bar-circle-${i} ${
          charge >= i ? "charged" : ""
        }`}
      >
        <div className="charge-bar-circle-icon"></div>
      </div>
    );
  }

  return (
    <div className={`charge-bar ${isPlayerTeam ? "playerTeam" : "enemyTeam"}`}>
      <h4>{isPlayerTeam ? "Your Charge" : "Enemy Charge"}</h4>
      {circles}
      <div
        className={`charge-bar-main-circle ${charge === 10 ? "charged" : ""}`}
      >
        {charge < 10 && <h3>{charge}</h3>}
      </div>
    </div>
  );
};

export default ChargeBar;
