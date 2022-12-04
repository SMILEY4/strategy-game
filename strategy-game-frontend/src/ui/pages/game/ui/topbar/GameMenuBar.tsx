import {ReactElement} from "react";
import {useCountryPlayerOrNull} from "../../../../../core/hooks/useCountryPlayer";
import {useCountryProvinces} from "../../../../../core/hooks/useCountryProvinces";
import {Color} from "../../../../../core/models/Color";
import "./gameMenuBar.css";
import {Province} from "../../../../../core/models/province";
import {ResourceLabel} from "../../../../components/specific/ResourceLabel";
import {CategoryDebug} from "../MenuDebug";
import {CategoryMap} from "../MenuMap";
import {CategorySelectedTile} from "../MenuSelectedTile";
import {NextTurnAction} from "./NextTurnAction";

export function GameMenuBar(): ReactElement {

    const country = useCountryPlayerOrNull();
    const countryColor = country ? country.color : Color.BLACK;
    const provinces = useCountryProvinces(country?.countryId)

    return (
        <div className="game-menu-bar">
            <div className="country-color"
                 style={{backgroundColor: `rgb(${countryColor.red},${countryColor.green},${countryColor.blue})`}}/>
            <div className="category-area">
                <CategoryDebug/>
                <CategorySelectedTile/>
                <CategoryMap/>
            </div>
            <div className="info-section">
                <ResourceLabel type={"money"} value={calcTotalBalanceMoney(provinces)} showPlusSign={true}/>
                <ResourceLabel type={"food"} value={calcTotalBalanceFood(provinces)} showPlusSign={true}/>
                <ResourceLabel type={"wood"} value={calcTotalBalanceWood(provinces)} showPlusSign={true}/>
                <ResourceLabel type={"stone"} value={calcTotalBalanceStone(provinces)} showPlusSign={true}/>
                <ResourceLabel type={"metal"} value={calcTotalBalanceMetal(provinces)} showPlusSign={true}/>
            </div>
            <div className="action-section">
                <NextTurnAction/>
            </div>
        </div>
    );

    function calcTotalBalanceMoney(provinces: Province[]): number {
        return provinces.map(p => p.resources?.money || 0).reduceRight((a,b) => a+b, 0)
    }

    function calcTotalBalanceWood(provinces: Province[]): number {
        return provinces.map(p => p.resources?.wood || 0).reduceRight((a,b) => a+b, 0)
    }

    function calcTotalBalanceStone(provinces: Province[]): number {
        return provinces.map(p => p.resources?.stone || 0).reduceRight((a,b) => a+b, 0)
    }

    function calcTotalBalanceMetal(provinces: Province[]): number {
        return provinces.map(p => p.resources?.metal || 0).reduceRight((a,b) => a+b, 0)
    }

    function calcTotalBalanceFood(provinces: Province[]): number {
        return provinces.map(p => p.resources?.food || 0).reduceRight((a,b) => a+b, 0)
    }

}
