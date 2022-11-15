package de.ruegnerlukas.strategygame.ecosim.report

import com.github.sh0nk.matplotlib4j.NumpyUtils
import com.github.sh0nk.matplotlib4j.Plot
import de.ruegnerlukas.strategygame.ecosim.world.PopType
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.World
import kotlin.math.min

class Report {

    private val values = mutableMapOf<String, MutableList<Double>>()
    private val plt = Plot.create()

    fun add(world: World) {
        addValue(world, "pop.psnt") { w -> w.cities.sumOf { it.getPop(PopType.PEASANT).amount } }
        addValue(world, "pop-growth.psnt") { w -> w.cities.first().getPop(PopType.PEASANT).growthProgress }
        addValue(world, "food-blnc.psnt") { w -> w.cities.first().getPop(PopType.PEASANT).getResourceBalance(ResourceType.FOOD) }
        addValue(world, "city.overpop") { w -> w.cities.first().overpopulationModifier }
    }

    private fun addValue(world: World, name: String, provider: (world: World) -> Number) {
        values
            .computeIfAbsent(name) { mutableListOf() }
            .add(provider(world).toDouble())
    }

    fun showPlot() {
        plt.close()
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

    fun print() {
        val rowCount = values.values.first().size
        val columnNames = values.keys.toList()
        val rows = (0 until rowCount).map { row -> columnNames.map { col -> values[col]?.get(row) ?: 0.0 } }
        val strHeader = columnNames.joinToString(" | ").let { "| $it |" }

        println(strHeader)
        println(columnNames.map { "-".repeat(it.length) }.joinToString("-|-").let { "|-$it-|" })
        rows
            .map { row ->
                row
                    .map { it.toString() }
                    .mapIndexed { index, value -> value.subSequence(0, min(value.length, columnNames[index].length)) }
                    .mapIndexed { index, value -> value.padStart(columnNames[index].length) }
                    .joinToString(" | ")
                    .let { "| $it |" }
            }
            .forEach { strRow ->
                println(strRow)
            }

    }

}