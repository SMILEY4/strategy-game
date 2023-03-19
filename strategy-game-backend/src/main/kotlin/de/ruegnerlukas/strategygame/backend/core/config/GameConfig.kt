package de.ruegnerlukas.strategygame.backend.core.config

data class GameConfig(
    /**
     * the amount of money a country starts with
     */
    val startingAmountMoney: Float = 200f,
    /**
     * the radius of the uncovered country starting area
     */
    val startingAreaRadius: Int = 3,
    /**
     * the amount of money a town costs to build
     */
    val townCostMoney: Float = 25f,
    /**
     * the amount of money a city costs to build
     */
    val cityCostMoney: Float = 50f,
    /**
     * the amount of wood a building in a city costs to build
     */
    val buildingCostWood: Float = 100f,
    /**
     * the amount of stone a building in a city costs to build
     */
    val buildingCostStone: Float = 50f,
    /**
     * The max amount of buildings in a town
     */
    val townBuildingSlots: Int = 6,
    /**
     * The max amount of buildings in a city
     */
    val cityBuildingSlots: Int = 6,
    /**
     * the max amount of influence another country can have on a tile to still be able to build the city
     */
    val cityTileMaxForeignInfluence: Float = 3f,
    /**
     * the amount of money produced by a city each turn
     */
    val cityIncomePerTurn: Float = 10f,
    /**
     * the amount of food consumed by a city each turn
     */
    val cityFoodCostPerTurn: Float = 2f,
    /**
     * the amount of food consumed by a town each turn
     */
    val townFoodCostPerTurn: Float = 1f,
    /**
     * the max amount of influence a town generates
     */
    val townInfluenceAmount: Float = 10f,
    /**
     * the distance the town spreads its influence
     */
    val townInfluenceSpread: Float = 2.5f,
    /**
     * the max amount of influence a city generates
     */
    val cityInfluenceAmount: Float = 10f,
    /**
     * the distance the city spreads its influence
     */
    val cityInfluenceSpread: Float = 6.5f,
    /**
     * the maximum range a city can affect a tile
     */
    val cityMaxRange: Int = 5,
    /**
     * the total amount of influence a country must have on a tile to own it
     */
    val tileOwnerInfluenceThreshold: Float = 5f,
    /**
     * the visibility radius of a scout
     */
    val scoutVisibilityRange: Int = 4,
    /**
     * The amount of turns a scout is active/alive
     */
    val scoutLifetime: Int = 3,
    /**
     * The max amount of active scouts a country can have
     */
    val scoutsMaxAmount: Int = 4,
    /**
     * The max amount of tiles a route between to cities is allowed to have
     */
    val maxRouteLength: Int = 10
) {
    companion object {
        fun default() = GameConfig()
    }
}