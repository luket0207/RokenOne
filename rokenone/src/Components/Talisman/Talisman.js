import "./Talisman.scss";

const Talisman = ({ talisman, noDescription = false }) => {
  return (
    <div className={`talisman-icon ${talisman.colour}`}>
      <div className="talisman-inner">
        <div className="talisman-inner-content">
          <p>{talisman.name}</p>
        </div>
      </div>
      {!noDescription && <div className="talisman-description"><p>{talisman.description}</p></div>}
    </div>
  );
};

export default Talisman;
