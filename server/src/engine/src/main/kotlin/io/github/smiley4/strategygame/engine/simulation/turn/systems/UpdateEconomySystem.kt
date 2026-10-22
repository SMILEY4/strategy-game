package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionMode
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ResourceDefinition
import io.github.smiley4.strategygame.engine.simulation.turn.tools.economy.EconomySystemBuilder
import kotlin.math.min

internal class UpdateEconomySystem(private val economyBuilder: EconomySystemBuilder) : GameSystem {

    override fun execute(gameState: GameStateContext) {

        val economyRegions = economyBuilder.buildRegions(gameState)

        economyRegions.forEach { region ->

            val activities = economyBuilder.buildActivities(region)

            activities.getConsumptionPassKeys().forEach { consumptionPass ->

                activities.get(consumptionPass, ConsumptionMode.ALL_OR_NOTHING).forEach { activity ->
                    // todo: handle condition: "requires another activity to have consumed"
                    activity.consumption?.also { consumption ->
                        val hasConsumed = takeAll(region.storedResources, consumption.resources)
                        TODO("handle hasConsumed")
                    }
                }

                activities.get(consumptionPass, ConsumptionMode.PARTIAL).forEach { activity ->
                    // todo: handle condition: "requires another activity to have consumed"
                    activity.consumption?.also { consumption ->
                        val consumedResources = takePartial(region.storedResources, consumption.resources)
                        TODO("handle consumedResources")
                    }
                }

            }

            activities.get().forEach { activity ->
                // todo: handle condition: "has consumed"
                activity.production?.also { production ->
                    put(region.storedResources, production.resources)
                }
            }

        }

    }


    private fun takeAll(available: MutableMap<ResourceDefinition.Key, Float>, required: Map<ResourceDefinition.Key, Float>): Boolean {
        val hasAvailable = required.all { (resourceKey, amountRequired) -> (available[resourceKey] ?: 0f) >= amountRequired }
        if (hasAvailable) {
            required.forEach { (resourceKey, amountRequired) ->
                available[resourceKey] = (available[resourceKey] ?: 0f) - amountRequired
            }
        }
        return hasAvailable
    }

    private fun takePartial(
        available: MutableMap<ResourceDefinition.Key, Float>,
        required: Map<ResourceDefinition.Key, Float>
    ): Map<ResourceDefinition.Key, Float> {
        val consumed = mutableMapOf<ResourceDefinition.Key, Float>()
        required.forEach { (resourceKey, amountRequired) ->
            val amountAvailable = available[resourceKey] ?: 0f
            if (amountAvailable > 0) {
                val amountConsume = min(amountAvailable, amountRequired)
                available[resourceKey] = amountAvailable - amountConsume
                consumed[resourceKey] = amountConsume
            }
        }
        return consumed
    }

    private fun put(available: MutableMap<ResourceDefinition.Key, Float>, additional: Map<ResourceDefinition.Key, Float>) {
        additional.forEach { (resourceKey, amountAdd) ->
            available[resourceKey] = (available[resourceKey] ?: 0f) + amountAdd
        }
    }

}


