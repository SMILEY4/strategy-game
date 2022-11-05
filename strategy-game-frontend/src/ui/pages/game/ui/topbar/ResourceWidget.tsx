import resourceIconFoodImageUrl from "/resource_icon_food.png?url";
import resourceIconMetalImageUrl from "/resource_icon_metal.png?url";

import resourceIconMoneyImageUrl from "/resource_icon_money.png?url";
import resourceIconStoneImageUrl from "/resource_icon_stone.png?url";
import resourceIconWoodImageUrl from "/resource_icon_wood.png?url";
import {ReactElement} from "react";
import "./resourceWidget.css";
import {ResourceValue} from "../../../../../core/models/resourceValue";


export function ResourceWidget(props: {resource: ResourceValue}): ReactElement {

    return (
        <div className="resource-widget">
            <div className={"icon " + props.resource.type} style={{
                backgroundImage: getBackgroundImage(props.resource.type)
            }}/>
            <div className={"labels"}>
                <div className={"amount " + side(props.resource.value)}>{formatNumber(props.resource.value, false)}</div>
                <div className={"change " + side(props.resource.change)}>{formatNumber(props.resource.change, true)}</div>
            </div>
        </div>
    );

    function formatNumber(value: number, positiveSign: boolean): string {
        let absValue = Math.abs(value);
        let isThousands = false;
        if (absValue >= 1000) {
            absValue = absValue / 1000;
            isThousands = true;
        }
        absValue = toFixedIfNecessary(absValue, 2);
        if (value < 0) {
            return "-" + absValue + (isThousands ? "K" : "");
        }
        if (value > 0) {
            return (positiveSign ? "+" : "") + absValue + (isThousands ? "K" : "");
        }
        return "" + absValue + (isThousands ? "K" : "");
    }

    function toFixedIfNecessary(value: number, dp: number) {
        return +parseFloat("" + value).toFixed(dp);
    }

    function side(value: number): string {
        if (value < 0) {
            return "negative";
        }
        if (value > 0) {
            return "positive";
        }
        return "none";
    }

    function getBackgroundImage(type: "money" | "food" | "wood" | "stone" | "metal"): string {
        if (type === "money") {
            return "url(" + resourceIconMoneyImageUrl + ")";
        }
        if (type === "food") {
            return "url(" + resourceIconFoodImageUrl + ")";
        }
        if (type === "wood") {
            return "url(" + resourceIconWoodImageUrl + ")";
        }
        if (type === "stone") {
            return "url(" + resourceIconStoneImageUrl + ")";
        }
        if (type === "metal") {
            return "url(" + resourceIconMetalImageUrl + ")";
        }
        return "error";
    }

}