package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext

internal class UpdateEconomySystem : GameSystem {

    private data class EconomicRegion(
        val administeringEntity: Entity.Id,
        val members: List<Entity>
    )

    override fun execute(gameState: GameStateContext) {
        buildEconomicRegions(gameState).forEach { update(gameState, it) }
    }

    private fun update(gameState: GameStateContext, region: EconomicRegion) {
        TODO()
    }

    private fun buildEconomicRegions(gameState: GameStateContext): List<EconomicRegion> {
        return gameState.entities
            .filter {
                val hierarchyComponent = it.getComponentOrNull<EntityComponent.RealmHierarchy>()
                hierarchyComponent != null && hierarchyComponent.administeredBy == null
            }
            .map { regionAdmin ->
                EconomicRegion(
                    administeringEntity = regionAdmin.id,
                    members = gameState.entities.filter { entity ->
                        val hierarchyComponent = entity.getComponentOrNull<EntityComponent.RealmHierarchy>()
                        hierarchyComponent != null && (entity.id == regionAdmin.id || hierarchyComponent.administeredBy == regionAdmin.id)
                    }
                )
            }
    }

}


