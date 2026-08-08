package io.github.smiley4.strategygame.engine.simulation.playerstate

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Builds the game state snapshot visible to a specific player.
 */
class PlayerStateBuilder {

    fun build(game: GameStateContext, player: UserId): ObjectType {
        return obj {
            "game" to obj {
                "turn" to game.turn
            }
            "tiles" to arr[
                game.tiles.map { tile(game, it, player) }
            ]
            "entities" to arr[
                game.entities
                    .filter { getVisibilityAt(game, it, player) != 0 }
                    .map { entity(it) }
            ]
        }
    }

    fun entity(entity: Entity) = obj {
        "id" to entity.id
        "owner" to entity.owner
        "components" to arr[
            entity.components.map { component ->
                when (component) {
                    is EntityComponent.Position -> {
                        "type" to "position"
                        "tileId" to component.tile.id
                        "q" to component.tile.position.q
                        "r" to component.tile.position.r
                    }
                    is EntityComponent.PlayerSpawn -> {
                        "type" to "player-spawn"
                        "radius" to component.radius
                    }
                    is EntityComponent.Settlement -> {
                        "type" to "settlement"
                        "isRealmCapital" to component.isRealmCapital
                    }
                }
            }
        ]
    }

    fun tile(game: GameStateContext, tile: Tile, player: UserId) = obj {
        val visibility = getVisibilityAt(tile, player)
        "id" to tile.id.id.toString()
        "visibility" to visibility
        "position" to obj {
            "q" to tile.position.q
            "r" to tile.position.r
        }
        "chunk" to obj {
            "q" to tile.meta.chunk.q
            "r" to tile.meta.chunk.r
        }
        "world" to hidden(visibility == 1) {
            obj {
                "biome" to tile.world.biome.name
                "elevation" to tile.world.elevation
                "feature" to tile.world.feature
                "resources" to arr[
                    tile.world.resources.map { resource ->
                        obj {
                            "type" to resource.type
                            "amount" to resource.amount
                            "maxAmount" to resource.maxAmount
                            "changeRate" to resource.changeRate
                            "removeOnDeplete" to resource.removeOnDeplete
                        }
                    }
                ]
            }
        }
        "createSettlement" to obj {
            "allowed" to SettlementValidation.validate(game, tile, player)
        }
        "meta" to obj {
            "seed" to tile.meta.seed
        }
    }

    private fun hidden(visible: Boolean, value: () -> ObjectType?) = obj {
        "visible" to visible
        if (visible) {
            "value" to value()
        }
    }


    private fun getVisibilityAt(gameState: GameStateContext, entity: Entity, player: UserId): Int {
        val position = entity.getComponentOrNull<EntityComponent.Position>()?.tile?.position
        if (position == null) return 0
        return getVisibilityAt(gameState, position, player)
    }

    private fun getVisibilityAt(gameState: GameStateContext, positions: HexPosition, player: UserId): Int {
        val tile = gameState.tiles.find { it.position == positions }
        if (tile == null) return 0
        return getVisibilityAt(tile, player)
    }

    private fun getVisibilityAt(tile: Tile, player: UserId): Int {
        return when {
            tile.discoveredBy.contains(player) -> 1
            else -> 0
        }
    }

}