import {ReactElement} from "react";
import "./gameMenuBar.css";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {UserStateHooks} from "../../../../external/state/user/userStateHooks";
import {Country} from "../../../../models/state/country";
import {CategoryDebug} from "./MenuDebug";
import {CategoryOther} from "./MenuOther";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {

    const userId = UserStateHooks.useUserId()
    const country = GameStateHooks.useCountry(userId)
    const countryColor = country ? country.color : "black"

    return (
        <div className="game-menu-bar">
            <div className="country-color" style={{backgroundColor: countryColor}}/>
            <div className="category-area">
                <CategoryOther/>
                <CategoryDebug/>
            </div>
            <div className="info-section">
                <MoneyResource country={country}/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}

export function MoneyResource(props: {country: Country | undefined}): ReactElement {
    if(props.country) {
        return (<div>{"Money: " + props.country!!.resources.money}</div>);
    } else {
        return <div></div>
    }
}
