package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateNeighbours
import java.util.ArrayDeque

internal class UpdateControlSystem : GameSystem {

    override fun execute(gameState: GameStateContext) {
        clear(gameState)
        val tilesByPosition = gameState.tiles.associateBy { it.position }
        for (entity in gameState.entities) {
            if (entity.owner == null) continue
            entity.getComponentsOrNull<EntityComponent.Control, EntityComponent.Position>()?.also { (control, position) ->
                update(entity, entity.owner, control, position, tilesByPosition)
            }
        }
    }

    private fun clear(gameState: GameStateContext) {
        gameState.tiles.forEach { it.political.control.clear() }
    }

    private fun update(
        entity: Entity,
        realm: Realm.Id,
        controlComponent: EntityComponent.Control,
        positionComponent: EntityComponent.Position,
        tilesByPosition: Map<HexPosition, Tile>,
    ) {
        val sourceTile = tilesByPosition[positionComponent.tile.position] ?: return
        val sourceSettlement = entity.getComponentOrNull<EntityComponent.TileImprovement>()?.administeringSettlement
            ?: if(entity.hasComponent<EntityComponent.Settlement>()) entity.id else null

        val queue = ArrayDeque<Pair<Tile, Float>>()
        val visited = mutableMapOf<Tile.Id, Float>()

        queue.addLast(sourceTile to controlComponent.amount)
        visited[sourceTile.id] = controlComponent.amount

        while (queue.isNotEmpty()) {
            val (current, currentAmount) = queue.removeFirst()
            if (currentAmount != visited[current.id]) continue

            current.political.control[entity.id] = Tile.ControlEntry(
                realm = realm,
                entity = entity.id,
                settlement = sourceSettlement,
                amount = currentAmount,
            )
            current.political.discoveredBy.add(realm)

            current.position.iterateNeighbours { neighbourPosition ->
                val neighbour = tilesByPosition[neighbourPosition] ?: return@iterateNeighbours
                val remainingAmount = currentAmount - getCostTo(neighbour)
                if (remainingAmount <= 0) {
                    return@iterateNeighbours
                }
                val previousAmount = visited[neighbour.id]
                if (previousAmount == null || remainingAmount > previousAmount) {
                    visited[neighbour.id] = remainingAmount
                    queue.addLast(neighbour to remainingAmount)
                }
            }
        }
    }

    private fun getCostTo(to: Tile): Float {
        return when {
            (to.world.biome == Tile.Biome.OCEAN) -> Float.POSITIVE_INFINITY
            (to.world.elevation == Tile.Elevation.MOUNTAINS) -> 5f
            (to.world.elevation == Tile.Elevation.HILLS) -> 2f
            (to.world.feature == Tile.Feature.FOREST) -> 1.5f
            else -> 1.0f
        }
    }

}
