package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ResourceDefinition

data class EconomicRegion(
    val members: List<Entity>,
    val storedResources: MutableMap<ResourceDefinition.Key, Float>
)

