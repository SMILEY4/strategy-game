package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionMode
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ResourceDefinition
import io.github.smiley4.strategygame.engine.simulation.turn.tools.economy.EconomicActivity
import io.github.smiley4.strategygame.engine.simulation.turn.tools.economy.EconomySystemBuilder
import kotlin.math.min

internal class UpdateEconomySystem(private val economyBuilder: EconomySystemBuilder) : GameSystem {

    override fun execute(gameState: GameStateContext) {

        val economyRegions = economyBuilder.buildRegions(gameState)

        // for each economic region
        economyRegions.forEach { region ->

            val activities = economyBuilder.buildActivities(region)

            // iterate consumption passes
            activities.getConsumptionPassKeys().forEach { consumptionPass ->

                // consume all or nothing for this pass
                activities.get(consumptionPass, ConsumptionMode.ALL_OR_NOTHING).forEach { activity ->

                    // check if dependencies are fulfilled
                    val activityPreconditionFulfilled = activity.dependsOn
                        ?.let { activities.get(it) }
                        ?.let { it.consumptionResult is EconomicActivity.ResultConsumption.Success }
                        ?: true

                    // try to consume
                    if (activityPreconditionFulfilled) {
                        activity.consumption?.also { consumption ->
                            val hasConsumed = takeAll(region.storedResources, consumption.resources)
                            activity.consumptionResult = if (hasConsumed) {
                                EconomicActivity.ResultConsumption.Success(consumption.resources.toMap())
                            } else {
                                EconomicActivity.ResultConsumption.Failed()
                            }
                        }
                    }

                }

                // consume partial for this pass
                val partialConsumptionActivities = activities.get(consumptionPass, ConsumptionMode.PARTIAL)

                val totalRequired = partialConsumptionActivities
                    .mapNotNull { it.consumption?.resources }
                    .let { sum(it) }

                val availabilityRatios = calculateAvailabilityRatios(region.storedResources, totalRequired)

                partialConsumptionActivities.forEach { activity ->

                    // check if dependencies are fulfilled
                    val activityPreconditionFulfilled = activity.dependsOn
                        ?.let { activities.get(it) }
                        ?.let { it.consumptionResult is EconomicActivity.ResultConsumption.Success }
                        ?: true

                    // try to consume
                    if (activityPreconditionFulfilled) {
                        activity.consumption?.also { consumption ->
                            val consumedResources = takePartial(region.storedResources, consumption.resources, availabilityRatios)
                            activity.consumptionResult = if (consumedResources.isNotEmpty()) {
                                EconomicActivity.ResultConsumption.Success(consumedResources)
                            } else {
                                EconomicActivity.ResultConsumption.Failed()
                            }
                        }
                    }
                }

            }

            // handle all that do not need to consume
            activities.get()
                .filter { it.consumptionResult is EconomicActivity.ResultConsumption.NotEvaluated }
                .forEach { activity ->
                    if (activity.consumption == null) {
                        activity.consumptionResult = EconomicActivity.ResultConsumption.Success(emptyMap())
                    }
                }

            // produce
            activities.get().forEach { activity ->
                if (activity.consumptionResult is EconomicActivity.ResultConsumption.Success) {
                    activity.production?.also { production ->
                        put(region.storedResources, production.resources)
                    }
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
        required: Map<ResourceDefinition.Key, Float>,
        availabilityRatios: Map<ResourceDefinition.Key, Float>
    ): Map<ResourceDefinition.Key, Float> {
        val consumed = mutableMapOf<ResourceDefinition.Key, Float>()
        required.forEach { (resourceKey, amountRequired) ->
            val amountAvailable = available[resourceKey] ?: 0f
            val ratioAvailability = availabilityRatios[resourceKey] ?: 0f
            if (amountAvailable > 0 && ratioAvailability > 0) {
                val amountConsume = min(amountAvailable, amountRequired * ratioAvailability)
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

    private fun sum(resourcePackages: List<Map<ResourceDefinition.Key, Float>>): Map<ResourceDefinition.Key, Float> {
        val sum = mutableMapOf<ResourceDefinition.Key, Float>()
        resourcePackages.forEach { resources ->
            resources.forEach { (resource, amount) ->
                sum[resource] = amount + (sum[resource] ?: 0f)
            }
        }
        return sum
    }

    private fun calculateAvailabilityRatios(
        available: Map<ResourceDefinition.Key, Float>,
        required: Map<ResourceDefinition.Key, Float>
    ): Map<ResourceDefinition.Key, Float> {
        return required.mapValues { (resource, amountRequired) ->
            val amountAvailable = available[resource] ?: 0f
            (amountAvailable / amountRequired).coerceIn(0f, 1f)
        }
    }

}


