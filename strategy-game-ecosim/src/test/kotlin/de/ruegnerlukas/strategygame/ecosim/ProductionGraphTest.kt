package de.ruegnerlukas.strategygame.ecosim

import de.ruegnerlukas.strategygame.ecosim.world.ProductionGraph
import io.kotest.core.spec.style.StringSpec

class ProductionGraphTest : StringSpec({
    "build resource graph" {
        val graph = ProductionGraph()
        println(graph.getAsDotGraph())
    }
    "consume resource graph" {
        ProductionGraph().consume { building ->
            println(building)
        }
    }
})