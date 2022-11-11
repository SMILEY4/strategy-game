package de.ruegnerlukas.strategygame.ecosim

import de.ruegnerlukas.strategygame.ecosim.report.Report
import de.ruegnerlukas.strategygame.ecosim.utils.WeightedCollection
import de.ruegnerlukas.strategygame.ecosim.utils.nextIntBetweenInclusive
import de.ruegnerlukas.strategygame.ecosim.world.City
import de.ruegnerlukas.strategygame.ecosim.world.FreemenPopUnit
import de.ruegnerlukas.strategygame.ecosim.world.GentryPopUnit
import de.ruegnerlukas.strategygame.ecosim.world.Market
import de.ruegnerlukas.strategygame.ecosim.world.PopUnit
import de.ruegnerlukas.strategygame.ecosim.world.ResourceNode
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit
import de.ruegnerlukas.strategygame.ecosim.world.World
import io.kotest.core.spec.style.StringSpec
import java.util.Random

class BasicTest : StringSpec({

    "basics" {

        val world = World(
            cities = listOf(
                City(
                    name = "city_a",
                    population = getInitPopulation(),
                    foodYield = 1.3f,
                    market = Market()
                ),
            ),
            agricultureEfficiency = 1.0f
        )

        val simulation = SimSetup.build(world)
        val report = Report()

        report.add(world)
        for (i in 0..100) {
            simulation.run()
            report.add(world)
        }

        report.showPlot()

    }

})


fun getInitPopulation(): List<PopUnit> {
    val serfAmount = 5 to 20
    val freemenAmount = 2 to 10
    val gentryAmount = 1 to 2
    return mutableListOf<PopUnit>().apply {
        add(
            SerfPopUnit(
                amount = Random().nextIntBetweenInclusive(serfAmount),
                foodTaxRate = 0.5f,
                foodConsumption = 0.6f
            )
        )
//        add(
//            FreemenPopUnit(
//                amount = Random().nextIntBetweenInclusive(freemenAmount),
//            )
//        )
        add(
            GentryPopUnit(
                amount = Random().nextIntBetweenInclusive(gentryAmount),
                foodConsumption = 1.5f
            )
        )
    }
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
