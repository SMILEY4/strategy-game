import {ReactElement} from "react";
import {useCountryMoney} from "../../../../core/hooks/useCountryMoney";
import {useCountryPlayerOrNull} from "../../../../core/hooks/useCountryPlayer";
import {useCountryResources} from "../../../../core/hooks/useCountryResources";
import {Color} from "../../../../models/state/Color";
import "./gameMenuBar.css";
import {CategoryDebug} from "./MenuDebug";
import {CategoryMap} from "./MenuMap";
import {CategoryOther} from "./MenuOther";
import {NextTurnAction} from "./NextTurnAction";

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
                <ResourceDisplay label={"Money"} amount={countryResources.money}/>
                <ResourceDisplay label={"Food"} amount={countryResources.food}/>
                <ResourceDisplay label={"Wood"} amount={countryResources.wood}/>
                <ResourceDisplay label={"Stone"} amount={countryResources.stone}/>
                <ResourceDisplay label={"Metal"} amount={countryResources.metal}/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );
}

export function ResourceDisplay(props: {label: string, amount: number}): ReactElement {
    return (
        <div>{props.label + ": " + props.amount}</div>
    );
}
