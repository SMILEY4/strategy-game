import {ReactElement} from "react";
import "./gameMenuBar.css";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {UserStateHooks} from "../../../../external/state/user/userStateHooks";
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
                <FoodResource/>
                <WoodResource/>
                <StoneResource/>
                <MetalResource/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}


export function FoodResource(): ReactElement {
    return (<div>F: 298/400 (+4)</div>);
}

export function WoodResource(): ReactElement {
    return (<div>W: 4503/6000 (+24)</div>);
}

export function StoneResource(): ReactElement {
    return (<div>S: 280/300 (+3)</div>);
}

export function MetalResource(): ReactElement {
    return (<div>M: 59/100 (-2)</div>);
}


