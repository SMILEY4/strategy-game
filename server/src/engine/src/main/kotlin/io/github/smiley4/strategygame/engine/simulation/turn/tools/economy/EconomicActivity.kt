package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionMode
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionPassKey
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ResourceDefinition

data class EconomicActivity(
    val source: EconomicSource,
    val consumption: Consumption?,
    val production: Production?
) {

    data class Consumption(
        val resources: Map<ResourceDefinition.Key, Float>,
        val mode: ConsumptionMode,
        val pass: ConsumptionPassKey
    )

    data class Production(
        val resources: Map<ResourceDefinition.Key, Float>,
    )

}