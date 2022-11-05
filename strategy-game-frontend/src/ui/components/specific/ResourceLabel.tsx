import resourceIconFoodImageUrl from "/resource_icon_food.png?url";
import resourceIconMetalImageUrl from "/resource_icon_metal.png?url";
import resourceIconMoneyImageUrl from "/resource_icon_money.png?url";
import resourceIconStoneImageUrl from "/resource_icon_stone.png?url";
import resourceIconWoodImageUrl from "/resource_icon_wood.png?url";
import {ReactElement} from "react";
import "./resourceLabel.css";


export function ResourceLabel(props: {
    type: "money" | "wood" | "stone" | "metal" | "food",
    value: number,
    showPlusSign: boolean
}): ReactElement {

    return (
        <span className="resource-label">
            <span className={"value " + side(props.value, props.showPlusSign)}>
                {formatNumber(props.value, props.showPlusSign)}
            </span>
            <span className={"icon " + props.type} style={{
                backgroundImage: getBackgroundImage(props.type)
            }}/>
        </span>
    );

    function formatNumber(value: number, showPlusSign: boolean): string {
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
            return (showPlusSign ? "+" : "") + absValue + (isThousands ? "K" : "");
        }
        return "" + absValue + (isThousands ? "K" : "");
    }

    function toFixedIfNecessary(value: number, dp: number) {
        return +parseFloat("" + value).toFixed(dp);
    }

    function side(value: number, showPlusSign: boolean): string {
        if (value < 0) {
            return "negative";
        }
        if (value > 0 && showPlusSign) {
            return "positive";
        }
        return "neutral";
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