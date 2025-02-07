import "./Pack.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faCubesStacked } from "@fortawesome/free-solid-svg-icons";

const Pack = ({
  rarity,
  actionClass = "",
  actionType = "",
  classTier = 0,
  cost,
  onClick,
  noAnimate = false,
}) => {
  return (
    <div
      className={`pack-container ${
        !noAnimate && "animate"
      } rarity-${rarity} class-${actionClass} type-${actionType}`}
      onClick={() => onClick(rarity, actionType, actionClass, classTier, cost)}
    >
      <p>
        {rarity} {actionClass && actionClass} {actionType && actionType}{" "}
        {classTier > 0 && `tier ${classTier}`} pack
      </p>

      {!noAnimate && (
        <div
          className={`pack-container-cost ${
            actionClass ? `class-${actionClass}` : ""
          }`}
        >
          <p>
            <FontAwesomeIcon
              icon={actionClass === "" ? faCoins : faCubesStacked}
              className={actionClass && `class-${actionClass}`}
            /> {cost}
          </p>
        </div>
      )}
    </div>
  );
};

export default Pack;
