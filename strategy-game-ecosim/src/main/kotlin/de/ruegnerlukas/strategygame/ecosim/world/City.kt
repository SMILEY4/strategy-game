package de.ruegnerlukas.strategygame.ecosim.world

class City(
    val name: String,
    val population: List<PopUnit>,
    val market: Market,
    var foodYield: Float,
) {

    inline fun <reified T: PopUnit> getPop(): T {
        return population.filterIsInstance<T>().first()
    }

}