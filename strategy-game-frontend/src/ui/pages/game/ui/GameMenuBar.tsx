import {ReactElement} from "react";
import {useCountry} from "../../../../core/hooks/useCountry";
import {useCountryMoney} from "../../../../core/hooks/useCountryMoney";
import {useCountryPlayerOrNull} from "../../../../core/hooks/useCountryPlayer";
import {useUserId, useUserIdOrNull} from "../../../../core/hooks/useUserId";
import {Color} from "../../../../models/state/Color";
import "./gameMenuBar.css";
import {CategoryDebug} from "./MenuDebug";
import {CategoryMap} from "./MenuMap";
import {CategoryOther} from "./MenuOther";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {

    const country = useCountryPlayerOrNull();
    const countryColor = country ? country.color : Color.BLACK;

    return (
        <div className="game-menu-bar">
            <div className="country-color"
                 style={{backgroundColor: `rgb(${countryColor.red},${countryColor.green},${countryColor.blue})`}}/>
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
    const money = useCountryMoney();
    return (
        <div>{"Money: " + money}</div>
    );
}
