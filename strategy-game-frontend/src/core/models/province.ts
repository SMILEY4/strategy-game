export interface Province {
    provinceId: string,
    countryId: string,
    cityIds: string[],
    provinceCapitalCityId: string,
    resources: {
        money: number,
        wood: number,
        food: number,
        stone: number,
        metal: number
    } | null
}