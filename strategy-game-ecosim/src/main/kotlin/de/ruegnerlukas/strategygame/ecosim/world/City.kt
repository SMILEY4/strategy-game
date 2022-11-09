package de.ruegnerlukas.strategygame.ecosim.world

class City(
    val name: String,
    val population: List<PopUnit>,
    val resourceNodes: List<ResourceNode>,
    var foodYield: Float,
    var marketPriceFood: Float
) {

    inline fun <reified T: PopUnit> getPop(): T {
        return population.filterIsInstance<T>().first()
    }

}