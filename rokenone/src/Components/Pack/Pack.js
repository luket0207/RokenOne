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
  discount,
  canAfford,
}) => {
  return (
    <div
      className={`pack-container ${
        !noAnimate && "animate"
      } rarity-${rarity} class-${actionClass} type-${actionType} ${
        canAfford ? "" : "cantAfford"
      }`}
      onClick={() => onClick(rarity, actionType, actionClass, classTier, cost)}
    >
      <p>
        {rarity} {actionClass && actionClass} {actionType && actionType} pack
      </p>

      {!noAnimate && (
        <>
          {classTier > 0 && (
            <div className="pack-container-tier">
              <p>{classTier > 0 && `${classTier}`}</p>
            </div>
          )}
          <div
            className={`pack-container-cost ${
              actionClass ? `class-${actionClass}` : ""
            }`}
          >
            <p>
              <FontAwesomeIcon
                icon={actionClass === "" ? faCoins : faCubesStacked}
                className={actionClass && `class-${actionClass}`}
              />{" "}
              {cost}
            </p>
            {discount && <p className="discount">{discount}% off</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Pack;
