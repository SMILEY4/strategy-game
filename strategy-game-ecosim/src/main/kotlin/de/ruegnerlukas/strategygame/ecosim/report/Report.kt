package de.ruegnerlukas.strategygame.ecosim.report

import com.github.sh0nk.matplotlib4j.NumpyUtils
import com.github.sh0nk.matplotlib4j.Plot
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit
import de.ruegnerlukas.strategygame.ecosim.world.World

class Report {

    private val values = mutableMapOf<String, MutableList<Double>>()

    fun add(world: World) {
        addValue(world, "agri.efficiency") { w -> w.agricultureEfficiency * 100f }
        addValue(world, "food.yield") { w -> w.cities.map { it.foodYield }.sum() * 50f }
        addValue(world, "pop.serfs") { w -> w.cities.map { it.getPop<SerfPopUnit>().amount }.sum() }
        addValue(world, "serfs.balance.food") { w -> w.cities.map { it.getPop<SerfPopUnit>().getResourceBalance(ResourceType.FOOD) }.sum() * 50f }
        addValue(world, "serfs.balance.money") { w -> w.cities.map { it.getPop<SerfPopUnit>().getResourceBalance(ResourceType.MONEY) }.sum() }
        addValue(world, "serfs.stored.money") { w -> w.cities.map { it.getPop<SerfPopUnit>().getResourcesStored(ResourceType.MONEY) }.sum() }
        addValue(world, "serfs.food.produced") { w -> w.cities.map { it.getPop<SerfPopUnit>().getResourceInput(ResourceType.FOOD, "raw-production") }.sum() }
        addValue(world, "serfs.food.consumed") { w -> w.cities.map { it.getPop<SerfPopUnit>().getResourceOutput(ResourceType.FOOD, "consumption") }.sum() }
    }

    private fun addValue(world: World, name: String, provider: (world: World) -> Number) {
        values
            .computeIfAbsent(name) { mutableListOf() }
            .add(provider(world).toDouble())
    }

    fun showPlot() {
        val plt = Plot.create()

        val size = values.values.first().size
        val x = NumpyUtils.arange(0.0, size.toDouble()-1, 1.0)

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