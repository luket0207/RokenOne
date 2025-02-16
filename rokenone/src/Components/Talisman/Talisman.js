import "./Talisman.scss";

const Talisman = ({ talisman }) => {
  return (
    <div className={`talisman-icon ${talisman.colour}`}>
      <div className="talisman-inner">
        <div className="talisman-inner-content">
          <p>{talisman.name}</p>
        </div>
      </div>
      <div className="talisman-description"><p>{talisman.description}</p></div>
    </div>
  );
};

export default Talisman;
