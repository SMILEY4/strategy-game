import {ReactElement} from "react";
import {GameHooks} from "../../../../core/actions/GameHooks";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {UserStateHooks} from "../../../../external/state/user/userStateHooks";
import "./gameMenuBar.css";
import {Color} from "../../../../models/state/Color";
import {CategoryDebug} from "./MenuDebug";
import {CategoryMap} from "./MenuMap";
import {CategoryOther} from "./MenuOther";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {

    const userId = UserStateHooks.useUserId();
    const country = GameStateHooks.useCountry(userId);
    const countryColor = country ? country.color : Color.BLACK;

    return (
        <div className="game-menu-bar">
            <div className="country-color" style={{backgroundColor: `rgb(${countryColor.red},${countryColor.green},${countryColor.blue})`}}/>
            <div className="category-area">
                <CategoryOther/>
                <CategoryDebug/>
                <CategoryMap/>
            </div>
            <div className="info-section">
                <MoneyResource/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}

export function MoneyResource(): ReactElement {
    const money = GameHooks.useCountryMoney();
    return (
        <div>{"Money: " + money}</div>
    );
}
