import resourceIconBarrelImageUrl from "/resource_icon_barrel.png?url";
import resourceIconFoodImageUrl from "/resource_icon_food.png?url";
import resourceIconHideImageUrl from "/resource_icon_hide.png?url";
import resourceIconMetalImageUrl from "/resource_icon_metal.png?url";
import resourceIconStoneImageUrl from "/resource_icon_stone.png?url";
import resourceIconWineImageUrl from "/resource_icon_wine.png?url";
import resourceIconWoodImageUrl from "/resource_icon_wood.png?url";
import resourceIconParchmentImageUrl from "/resource_icon_parchment.png?url";
import resourceIconToolsImageUrl from "/resource_icon_tools.png?url";
import resourceIconWeaponImageUrl from "/resource_icon_weapon.png?url";
import resourceIconArmorImageUrl from "/resource_icon_armor.png?url";
import resourceIconJewelleriesImageUrl from "/resource_icon_jewelleries.png?url";
import resourceIconClothesImageUrl from "/resource_icon_clothes.png?url";
import resourceIconHorseImageUrl from "/resource_icon_horse.png?url";
import {ReactElement} from "react";
import {ResourceType} from "../../../core/models/resourceType";
import "./resourceLabel.css";


export function ResourceLabel(props: {
    type: ResourceType,
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

    function getBackgroundImage(type: ResourceType): string {
        if (type === ResourceType.ARMOR) return "url(" + resourceIconArmorImageUrl + ")";
        if (type === ResourceType.BARRELS) return "url(" + resourceIconBarrelImageUrl + ")";
        if (type === ResourceType.CLOTHES) return "url(" + resourceIconClothesImageUrl + ")";
        if (type === ResourceType.FOOD) return "url(" + resourceIconFoodImageUrl + ")";
        if (type === ResourceType.HIDE) return "url(" + resourceIconHideImageUrl + ")";
        if (type === ResourceType.HORSE) return "url(" + resourceIconHorseImageUrl + ")";
        if (type === ResourceType.JEWELLERIES) return "url(" + resourceIconJewelleriesImageUrl + ")";
        if (type === ResourceType.METAL) return "url(" + resourceIconMetalImageUrl + ")";
        if (type === ResourceType.PARCHMENT) return "url(" + resourceIconParchmentImageUrl + ")";
        if (type === ResourceType.STONE) return "url(" + resourceIconStoneImageUrl + ")";
        if (type === ResourceType.TOOLS) return "url(" + resourceIconToolsImageUrl + ")";
        if (type === ResourceType.WEAPONS) return "url(" + resourceIconWeaponImageUrl + ")";
        if (type === ResourceType.WINE) return "url(" + resourceIconWineImageUrl + ")";
        if (type === ResourceType.WOOD) return "url(" + resourceIconWoodImageUrl + ")";
        return "error";
    }

}