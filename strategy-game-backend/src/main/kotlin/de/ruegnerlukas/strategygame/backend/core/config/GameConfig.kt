package de.ruegnerlukas.strategygame.backend.core.config

data class GameConfig(
    /**
     * the radius of the uncovered country starting area
     */
    val startingAreaRadius: Int = 3,
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
     * the max amount of influence a city generates
     */
    val cityInfluenceAmount: Float = 10f,
    /**
     * the distance the city spreads its influence
     */
    val cityInfluenceSpread: Float = 5f,
    /**
     * the total amount of influence a country must have on a tile to own it
     */
    val tileOwnerInfluenceThreshold: Float = 7f,
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