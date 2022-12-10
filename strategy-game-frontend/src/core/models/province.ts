export interface Province {
    provinceId: string,
    countryId: string,
    cityIds: string[],
    provinceCapitalCityId: string,
    resources: {
        armor: number,
        barrels: number,
        clothes: number,
        food: number,
        hide: number,
        horse: number,
        jewelleries: number,
        metal: number,
        parchment: number,
        stone: number,
        tools: number,
        weapons: number,
        wine: number,
        wood: number,
    } | null
}