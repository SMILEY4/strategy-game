package io.github.smiley4.strategygame.engine.simulation.playerstate

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Builds the game state snapshot visible to a specific player.
 */
class PlayerStateBuilder {

    fun build(game: GameStateContext, player: UserId): ObjectType {
        val foundedFirstSettlement = game.entities.any {
            it.owner == player && it.getComponentOrNull<EntityComponent.PlayerSpawn>()?.foundedRealm == true
        }
        return obj {
            "game" to obj {
                "turn" to game.turn
            }
            "tiles" to arr[
                game.tiles.map { tile(game, it, player, foundedFirstSettlement) }
            ]
            "entities" to arr[
                game.entities
                    .filter { getVisibilityAt(game, it, player) != Visibility.UNDISCOVERED }
                    .filter { it.components.any { component -> component is EntityComponent.Position } }
                    .map { entity(game, it) }
            ]
        }
    }

    fun entity(game: GameStateContext, entity: Entity) = obj {
        val position = entity.getComponent<EntityComponent.Position>()
        val tile = game.tiles.first { it.id == position.tile.id }
        "id" to entity.id
        "owner" to entity.owner?.id?.toString()
        "position" to obj {
            "q" to position.tile.position.q
            "r" to position.tile.position.r
            "chunkQ" to tile.meta.chunk.q
            "chunkR" to tile.meta.chunk.r
        }
        "components" to arr[
            entity.components.map { component ->
                when (component) {
                    is EntityComponent.Position -> Unit
                    is EntityComponent.Vision -> Unit
                    is EntityComponent.PlayerSpawn -> obj {
                        "type" to "player-spawn"
                        "radius" to component.radius
                        "foundedFirstSettlement" to component.foundedRealm
                    }
                    is EntityComponent.Settlement -> obj {
                        "type" to "settlement"
                        "name" to component.name
                        "isRealmCapital" to component.isRealmCapital
                    }
                    is EntityComponent.Control -> obj {
                        "type" to "control"
                        "radius" to component.radius
                        "amount" to component.amount
                    }
                }
            }
        ]
    }

    fun tile(game: GameStateContext, tile: Tile, player: UserId, foundedFirstSettlement: Boolean) = obj {
        val visibility = getVisibilityAt(game, tile, player)
        "id" to tile.id.id.toString()
        "visibility" to visibility.name
        "position" to obj {
            "q" to tile.position.q
            "r" to tile.position.r
            "chunkQ" to tile.meta.chunk.q
            "chunkR" to tile.meta.chunk.r
        }
        "world" to hidden(visibility != Visibility.UNDISCOVERED) {
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
        "political" to hidden(visibility != Visibility.UNDISCOVERED) {
            obj {
                "control" to arr[ // todo: if source is not discovered -> show entries as unknown source
                    tile.political.control.map {
                        obj {
                            "player" to it.player.id.toString()
                            "settlement" to it.settlement.id.toString()
                            "amount" to it.amount
                        }
                    }
                ]
            }
        }
        "createSettlement" to obj {
            if (foundedFirstSettlement) {
                "available" to true
                "allowed" to SettlementValidation.validate(game, tile, player)
            } else {
                "firstAvailable" to true
                "firstAllowed" to SettlementValidation.validateFirst(game, tile, player)
            }
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


    private fun getVisibilityAt(gameState: GameStateContext, entity: Entity, player: UserId): Visibility {
        val position = entity.getComponentOrNull<EntityComponent.Position>()?.tile?.position
        if (position == null) return Visibility.UNDISCOVERED
        return getVisibilityAt(gameState, position, player)
    }

    private fun getVisibilityAt(gameState: GameStateContext, positions: HexPosition, player: UserId): Visibility {
        val tile = gameState.tiles.find { it.position == positions }
        if (tile == null) return Visibility.UNDISCOVERED
        return getVisibilityAt(gameState, tile, player)
    }

    private fun getVisibilityAt(gameState: GameStateContext, tile: Tile, player: UserId): Visibility {
        val hasDirectVision = gameState.entities
            .asSequence()
            .filter { it.owner == player }
            .filter { it.hasComponent<EntityComponent.Vision>() }
            .filter { it.hasComponent<EntityComponent.Position>() }
            .any {
                val range = it.getComponent<EntityComponent.Vision>().radius
                val position = it.getComponent<EntityComponent.Position>().tile.position
                position.distance(tile.position) <= range
            }
        return when {
            hasDirectVision -> Visibility.VISIBLE
            tile.political.discoveredBy.contains(player) -> Visibility.DISCOVERED
            else -> Visibility.UNDISCOVERED
        }
    }

}