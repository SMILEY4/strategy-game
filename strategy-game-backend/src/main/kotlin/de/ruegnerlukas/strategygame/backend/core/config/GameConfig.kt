package de.ruegnerlukas.strategygame.backend.core.config

data class GameConfig(
    /**
     * the amount of money a country starts with
     */
    val startingAmountMoney: Float = 200f,
    /**
     * the amount of wood a country starts with
     */
    val startingAmountWood: Float = 200f,
    /**
     * the amount of food a country starts with
     */
    val startingAmountFood: Float = 200f,
    /**
     * the amount of stone a country starts with
     */
    val startingAmountStone: Float = 100f,
    /**
     * the amount of metal a country starts with
     */
    val startingAmountMetal: Float = 100f,
    /**
     * the radius of the uncovered country starting area
     */
    val startingAreaRadius: Int = 3,
    /**
     * the amount of money a town costs to build
     */
    val townCost: Float = 25f,
    /**
     * the amount of money a city costs to build
     */
    val cityCost: Float = 50f,
    /**
     * the max amount of influence another country can have on a tile to still be able to build the city
     */
    val cityTileMaxForeignInfluence: Float = 3f,
    /**
     * the amount of money produced by a city each turn
     */
    val cityIncomePerTurn: Float = 10f,
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
    val scoutsMaxAmount: Int = 4
) {
    companion object {
        fun default() = GameConfig()
    }
}