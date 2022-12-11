import {ReactElement} from "react";
import {useCountryPlayerOrNull} from "../../../../../core/hooks/useCountryPlayer";
import {Color} from "../../../../../core/models/Color";
import "./gameMenuBar.css";
import {CategoryDebug} from "../MenuDebug";
import {CategoryMap} from "../MenuMap";
import {CategorySelectedTile} from "../MenuSelectedTile";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {

    const country = useCountryPlayerOrNull();
    const countryColor = country ? country.color : Color.BLACK;

    return (
        <div className="game-menu-bar">
            <div className="country-color"
                 style={{backgroundColor: `rgb(${countryColor.red},${countryColor.green},${countryColor.blue})`}}/>
            <div className="category-area">
                <CategoryDebug/>
                <CategorySelectedTile/>
                <CategoryMap/>
            </div>
            <div className="info-section"/>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );

}
