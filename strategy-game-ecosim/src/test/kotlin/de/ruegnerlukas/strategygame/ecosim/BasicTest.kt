package de.ruegnerlukas.strategygame.ecosim

import de.ruegnerlukas.strategygame.ecosim.report.Report
import de.ruegnerlukas.strategygame.ecosim.simulation.SimSetup
import de.ruegnerlukas.strategygame.ecosim.utils.WeightedCollection
import de.ruegnerlukas.strategygame.ecosim.world.Building
import de.ruegnerlukas.strategygame.ecosim.world.BuildingType
import de.ruegnerlukas.strategygame.ecosim.world.City
import de.ruegnerlukas.strategygame.ecosim.world.PopType
import de.ruegnerlukas.strategygame.ecosim.world.PopUnit
import de.ruegnerlukas.strategygame.ecosim.world.ResourceNode
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.World
import io.kotest.core.spec.style.StringSpec
import java.util.Random

class BasicTest : StringSpec({

    "basics" {
        run()
    }

})


fun main() {
    run()
}

fun run() {
    val world = World(
        cities = listOf(
            City(
                name = "city_a",
                population = getInitPopulation(),
                buildings = mutableListOf(
                    Building.farm()
                )
            ),
        ),
    )

    val simulation = SimSetup.build(world)
    val report = Report()

    do {
        report.add(world)
        report.print()

        val input = readLine()?.trim()?.lowercase()
        if(input == "q") {
            break
        }
        if (BuildingType.values().map { it.toString().lowercase() }.contains(input)) {
            BuildingType.values().find { it.toString().lowercase() == input }?.let { type ->
                val building = when (type) {
                    BuildingType.FARM -> Building.farm()
                    BuildingType.IRON_MINE -> Building.ironMine()
                }
                simulation.context.world.cities.first().buildings.add(building)
            }

        }

        simulation.run()

    } while (true)

    report.showPlot()

//        report.add(world)
//        for (i in 0..100) {
//            simulation.run()
//            report.add(world)
//            println("===========================")
//        }
//        report.showPlot()

}



fun getInitPopulation(): MutableList<PopUnit> {
    return mutableListOf(PopUnit(type = PopType.PEASANT, amount = 1))
}


fun getResourceNodes(): List<ResourceNode> {
    return WeightedCollection<ResourceType>()
        .apply {
            add(3.5, ResourceType.FOOD)
            add(2.5, ResourceType.WOOD)
            add(1.5, ResourceType.STONE)
            add(0.5, ResourceType.METAL)
        }
        .let { pool -> (1..9).map { ResourceNode(pool.chooseRandom(Random())) } }
}
