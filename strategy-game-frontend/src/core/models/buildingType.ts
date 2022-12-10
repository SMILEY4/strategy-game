import {ResourceType} from "./resourceType";
import {TileResourceType} from "./tileResourceType";

export enum BuildingType {
    ARMOR_SMITH = "ARMOR_SMITH",
    CATTLE_FARM = "CATTLE_FARM",
    COOPER = "COOPER",
    FARM = "FARM",
    FISHERS_HUT = "FISHERS_HUT",
    JEWELLER = "JEWELLER",
    MARKET = "MARKET",
    MINE = "MINE",
    PARCHMENTERS_WORKSHOP = "PARCHMENTERS_WORKSHOP",
    QUARRY = "QUARRY",
    SHEEP_FARM = "SHEEP_FARM",
    STABLES = "STABLES",
    TAILORS_WORKSHOP = "TAILORS_WORKSHOP",
    TOOLMAKER = "TOOLMAKER",
    WEAPON_SMITH = "WEAPON_SMITH",
    WINERY = "WINERY",
    WOODCUTTER = "WOODCUTTER",
}

export namespace BuildingType {

    export const ALL: BuildingType[] = [
        BuildingType.ARMOR_SMITH,
        BuildingType.CATTLE_FARM,
        BuildingType.COOPER,
        BuildingType.FARM,
        BuildingType.FISHERS_HUT,
        BuildingType.JEWELLER,
        BuildingType.MARKET,
        BuildingType.MINE,
        BuildingType.PARCHMENTERS_WORKSHOP,
        BuildingType.QUARRY,
        BuildingType.SHEEP_FARM,
        BuildingType.STABLES,
        BuildingType.TAILORS_WORKSHOP,
        BuildingType.TOOLMAKER,
        BuildingType.WEAPON_SMITH,
        BuildingType.WINERY,
        BuildingType.WOODCUTTER
    ]

    export function fromString(str: string): BuildingType {
        if(str === "ARMOR_SMITH") return BuildingType.ARMOR_SMITH;
        if(str === "CATTLE_FARM") return BuildingType.CATTLE_FARM;
        if(str === "COOPER") return BuildingType.COOPER;
        if(str === "FARM") return BuildingType.FARM;
        if(str === "FISHERS_HUT") return BuildingType.FISHERS_HUT;
        if(str === "JEWELLER") return BuildingType.JEWELLER;
        if(str === "MARKET") return BuildingType.MARKET;
        if(str === "MINE") return BuildingType.MINE;
        if(str === "PARCHMENTERS_WORKSHOP") return BuildingType.PARCHMENTERS_WORKSHOP;
        if(str === "QUARRY") return BuildingType.QUARRY;
        if(str === "SHEEP_FARM") return BuildingType.SHEEP_FARM;
        if(str === "STABLES") return BuildingType.STABLES;
        if(str === "TAILORS_WORKSHOP") return BuildingType.TAILORS_WORKSHOP;
        if(str === "TOOLMAKER") return BuildingType.TOOLMAKER;
        if(str === "WEAPON_SMITH") return BuildingType.WEAPON_SMITH;
        if(str === "WINERY") return BuildingType.WINERY;
        if(str === "WOODCUTTER") return BuildingType.WOODCUTTER;
        throw new Error("Unknown building type: " + str);
    }

    export function toDisplayString(type: BuildingType): string {
        if(type === BuildingType.ARMOR_SMITH) return "Armor Smith";
        if(type === BuildingType.CATTLE_FARM) return "Cattle Farm";
        if(type === BuildingType.COOPER) return "Cooper";
        if(type === BuildingType.FARM) return "Farm";
        if(type === BuildingType.FISHERS_HUT) return "Fishers Hut";
        if(type === BuildingType.JEWELLER) return "Jeweller";
        if(type === BuildingType.MARKET) return "Market";
        if(type === BuildingType.MINE) return "Mine";
        if(type === BuildingType.PARCHMENTERS_WORKSHOP) return "Parchmenter's Workshop";
        if(type === BuildingType.QUARRY) return "Quarry";
        if(type === BuildingType.SHEEP_FARM) return "Sheep Farm";
        if(type === BuildingType.STABLES) return "Stables";
        if(type === BuildingType.TAILORS_WORKSHOP) return "Tailor's Workshop";
        if(type === BuildingType.TOOLMAKER) return "Toolmaker";
        if(type === BuildingType.WEAPON_SMITH) return "Weapon Smith";
        if(type === BuildingType.WINERY) return "Winery";
        if(type === BuildingType.WOODCUTTER) return "Woodcutter";
        return "?"
    }

    export function consumes(type: BuildingType): ({type: ResourceType, amount: number})[] {
        if(type === BuildingType.ARMOR_SMITH) return [{type: ResourceType.METAL, amount: 1}]
        if(type === BuildingType.CATTLE_FARM) return [{type: ResourceType.FOOD, amount: 1}]
        if(type === BuildingType.COOPER) return [{type: ResourceType.WOOD, amount: 1}]
        if(type === BuildingType.FARM) return []
        if(type === BuildingType.FISHERS_HUT) return []
        if(type === BuildingType.JEWELLER) return [{type: ResourceType.METAL, amount: 1}]
        if(type === BuildingType.MARKET) return [{type: ResourceType.BARRELS, amount: 1}]
        if(type === BuildingType.MINE) return []
        if(type === BuildingType.PARCHMENTERS_WORKSHOP) return [{type: ResourceType.HIDE, amount: 1}]
        if(type === BuildingType.QUARRY) return []
        if(type === BuildingType.SHEEP_FARM) return [{type: ResourceType.FOOD, amount: 1}]
        if(type === BuildingType.STABLES) return [{type: ResourceType.FOOD, amount: 1}]
        if(type === BuildingType.TAILORS_WORKSHOP) return [{type: ResourceType.HIDE, amount: 1}]
        if(type === BuildingType.TOOLMAKER) return [{type: ResourceType.WOOD, amount: 1}]
        if(type === BuildingType.WEAPON_SMITH) return [{type: ResourceType.METAL, amount: 1}]
        if(type === BuildingType.WINERY) return [{type: ResourceType.BARRELS, amount: 1}]
        if(type === BuildingType.WOODCUTTER) return []
        return []
    }

    export function produces(type: BuildingType): ({type: ResourceType, amount: number})[] {
        if(type === BuildingType.ARMOR_SMITH) return [{type: ResourceType.ARMOR, amount: 1}]
        if(type === BuildingType.CATTLE_FARM) return [{type: ResourceType.FOOD, amount: 2}]
        if(type === BuildingType.COOPER) return [{type: ResourceType.BARRELS, amount: 1}]
        if(type === BuildingType.FARM) return [{type: ResourceType.FOOD, amount: 1}]
        if(type === BuildingType.FISHERS_HUT) return [{type: ResourceType.FOOD, amount: 1}]
        if(type === BuildingType.JEWELLER) return [{type: ResourceType.JEWELLERIES, amount: 1}]
        if(type === BuildingType.MARKET) return []
        if(type === BuildingType.MINE) return [{type: ResourceType.METAL, amount: 1}]
        if(type === BuildingType.PARCHMENTERS_WORKSHOP) return [{type: ResourceType.PARCHMENT, amount: 1}]
        if(type === BuildingType.QUARRY) return [{type: ResourceType.STONE, amount: 1}]
        if(type === BuildingType.SHEEP_FARM) return [{type: ResourceType.HIDE, amount: 1}]
        if(type === BuildingType.STABLES) return [{type: ResourceType.HORSE, amount: 1}]
        if(type === BuildingType.TAILORS_WORKSHOP) return [{type: ResourceType.CLOTHES, amount: 1}]
        if(type === BuildingType.TOOLMAKER) return [{type: ResourceType.TOOLS, amount: 1}]
        if(type === BuildingType.WEAPON_SMITH) return [{type: ResourceType.WEAPONS, amount: 1}]
        if(type === BuildingType.WINERY) return [{type: ResourceType.WINE, amount: 1}]
        if(type === BuildingType.WOODCUTTER) return [{type: ResourceType.WOOD, amount: 1}]
        return []
    }

}
