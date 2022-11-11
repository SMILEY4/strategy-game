package de.ruegnerlukas.strategygame.ecosim.report

import com.github.sh0nk.matplotlib4j.NumpyUtils
import com.github.sh0nk.matplotlib4j.Plot
import de.ruegnerlukas.strategygame.ecosim.world.PopType
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.World

class Report {

    private val values = mutableMapOf<String, MutableList<Double>>()

    fun add(world: World) {
        addValue(world, "pop.subsistence-farmer") { w -> w.cities.sumOf { it.getPop(PopType.SUBSISTENCE_FARMER).amount } }
        addValue(world, "pop.peasant") { w -> w.cities.sumOf { it.getPop(PopType.PEASANT).amount } }
        addValue(world, "pop-growth.subsistence-farmer") { w -> w.cities.first().getPop(PopType.SUBSISTENCE_FARMER).growthProgress }
        addValue(world, "pop-growth.peasant") { w -> w.cities.first().getPop(PopType.PEASANT).growthProgress }
        addValue(world, "food-balance.subsistence-farmer") { w -> w.cities.first().getPop(PopType.SUBSISTENCE_FARMER).getResourceBalance(ResourceType.FOOD) }
        addValue(world, "food-balance.peasant") { w -> w.cities.first().getPop(PopType.PEASANT).getResourceBalance(ResourceType.FOOD) }
    }

    private fun addValue(world: World, name: String, provider: (world: World) -> Number) {
        values
            .computeIfAbsent(name) { mutableListOf() }
            .add(provider(world).toDouble())
    }

    fun showPlot() {
        val plt = Plot.create()
        val x = NumpyUtils.arange(0.0, values.values.first().size.toDouble() - 1, 1.0)
        values.keys.forEach { key ->
            val y = x.asSequence().map { it.toInt() }.map { values[key]!![it] }.toList()
            plt.plot()
                .add(x, y)
                .label(key)
        }
        plt.legend()
        plt.show()
    }

}