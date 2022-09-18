export interface TileLayerMeta {
    layerId: string,
    amountValues: number, // max 4
}

export namespace TileLayerMeta {

    export const ID_COUNTRY = "country"
    export const ID_PROVINCE = "province"
    export const ID_CITY = "city"

    export const TILE_LAYERS: TileLayerMeta[] = [
        {
            layerId: ID_COUNTRY,
            amountValues: 3
        },
        {
            layerId: ID_PROVINCE,
            amountValues: 3
        },
        {
            layerId: ID_CITY,
            amountValues: 3
        }
    ];
}