package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionMode
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionPassKey
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ResourceDefinition
import kotlin.uuid.Uuid

data class EconomicActivity(
    val id: Uuid = Uuid.random(),
    val dependsOn: Uuid? = null,
    val source: EconomicSource,
    val consumption: Consumption?,
    val production: Production?,
    var consumptionResult: ResultConsumption = ResultConsumption.NotEvaluated(),
) {

    data class Consumption(
        val resources: Map<ResourceDefinition.Key, Float>,
        val mode: ConsumptionMode,
        val pass: ConsumptionPassKey
    )

    data class Production(
        val resources: Map<ResourceDefinition.Key, Float>,
    )

    interface ResultConsumption {

        class NotEvaluated : ResultConsumption

        class Success(
            val consumed: Map<ResourceDefinition.Key, Float>,
        ) : ResultConsumption

        class Failed : ResultConsumption

    }

}