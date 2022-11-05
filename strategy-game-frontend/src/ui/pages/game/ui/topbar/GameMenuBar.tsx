import {ReactElement} from "react";
import {useCountryPlayerOrNull} from "../../../../../core/hooks/useCountryPlayer";
import {useCountryResources} from "../../../../../core/hooks/useCountryResources";
import {Color} from "../../../../../core/models/Color";
import "./gameMenuBar.css";
import {CategoryDebug} from "../MenuDebug";
import {CategoryMap} from "../MenuMap";
import {CategoryOther} from "../MenuOther";
import {NextTurnAction} from "./NextTurnAction";
import {ResourceWidget} from "./ResourceWidget";

export function GameMenuBar(): ReactElement {

    const country = useCountryPlayerOrNull();
    const countryColor = country ? country.color : Color.BLACK;
    const countryResources = useCountryResources()

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
                <ResourceWidget resource={countryResources.money}/>
                <ResourceWidget resource={countryResources.wood}/>
                <ResourceWidget resource={countryResources.stone}/>
                <ResourceWidget resource={countryResources.metal}/>
                <ResourceWidget resource={countryResources.food}/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}
