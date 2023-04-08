export interface GameConfig {
    townCostMoney: number,
    townBuildingSlots: number,
    cityBuildingSlots: number,
    cityTileMaxForeignInfluence: number,
    cityIncomePerTurn: number,
    cityFoodCostPerTurn: number,
    townFoodCostPerTurn: number,
    cityBuildingProductionPerTurn: number,
    townBuildingProductionPerTurn: number,
    cityInfluenceAmount: number,
    cityInfluenceSpread: number,
    tileOwnerInfluenceThreshold: number,
    scoutVisibilityRange: number,
    scoutLifetime: number,
    scoutsMaxAmount: number
}