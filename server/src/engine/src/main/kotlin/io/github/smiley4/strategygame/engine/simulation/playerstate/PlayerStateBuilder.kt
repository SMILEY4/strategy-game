package io.github.smiley4.strategygame.engine.simulation.playerstate

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import io.github.smiley4.strategygame.engine.simulation.GameSettings
import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Route
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import io.github.smiley4.strategygame.engine.simulation.turn.tools.TileImprovementValidation
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Builds the game state snapshot visible to a specific player.
 */
internal class PlayerStateBuilder(
    private val settings: GameSettings,
    private val tileImprovementValidation: TileImprovementValidation,
    private val settlementValidation: SettlementValidation,
) {

    fun build(game: GameStateContext, player: UserId): ObjectType {

        val povRealm = game.realms.first { it.user == player }

        return obj {
            "game" to obj {
                "turn" to game.turn
            }
            "realms" to arr[
                game.realms.map { realm(it, povRealm.id) }
            ]
            "tiles" to arr[
                game.tiles.map { tile(game, it, povRealm.id) }
            ]
            "entities" to arr[
                game.entities
                    .filter { getVisibilityAt(game, it, povRealm.id) != Visibility.UNDISCOVERED }
                    .filter { it.components.any { component -> component is EntityComponent.Position } }
                    .map { entity(game, it) }
            ]
            "routes" to arr[
                game.routes
                    .filter { it.tiles.any { t -> getVisibilityAt(game, t.position, povRealm.id) != Visibility.UNDISCOVERED } }
                    .map { route(it) }
            ]
        }
    }

    fun realm(realm: Realm, povRealmId: Realm.Id) = obj {
        "id" to realm.id.id
        "color" to arr[
            listOf(
                realm.color.red.toInt(),
                realm.color.green.toInt(),
                realm.color.blue.toInt(),
            )
        ]
        "owned" to (realm.id == povRealmId)
        "phase" to realm.phase.name
        "spawnLocation" to obj {
            "q" to realm.spawnLocation.q
            "r" to realm.spawnLocation.r
        }
    }

    fun tile(game: GameStateContext, tile: Tile, realm: Realm.Id) = obj {

        val visibility = getVisibilityAt(tile, realm)

        val tileImprovementLocationValidationResult = tileImprovementValidation.validateConstructionLocation(game, tile, realm)
        val tileImprovementAvailableKeys = tileImprovementValidation.getValidForTile(tile)

        val settlementTerrainValidationResult = settlementValidation.validateTerrain(tile)
        val settlementValidationResult = settlementValidation.validate(game, tile, realm)

        "id" to tile.id.id
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
                "control" to arr[
                    tile.political.control.map { (_, control) ->
                        obj {
                            "realm" to control.realm.id
                            "entity" to control.entity.id
                            "settlement" to control.settlement?.id
                            "amount" to control.amount
                        }
                    }
                ]
                "ownerRealm" to tile.political.ownerRealm?.id
                "conversion" to tile.political.conversion?.let { conversion ->
                    obj {
                        "targetRealm" to conversion.targetRealm?.id
                        "progress" to conversion.progress
                    }
                }
            }
        }
        "createSettlement" to hidden(visibility != Visibility.UNDISCOVERED) {
            obj {
                "valid" to (settlementValidationResult == null)
                "validTerrain" to (settlementTerrainValidationResult == null
                        && settlementValidationResult != SettlementValidation.FailureReason.ALREADY_OCCUPIED)
            }
        }
        "createTileImprovement" to hidden(visibility != Visibility.UNDISCOVERED) {
            obj {
                "validLocation" to (tileImprovementLocationValidationResult == null)
                "availableImprovementKeys" to arr[tileImprovementAvailableKeys.map { it.value }]
            }
        }
        "meta" to obj {
            "seed" to tile.meta.seed
        }
    }

    fun entity(game: GameStateContext, entity: Entity) = obj {
        val position = entity.getComponent<EntityComponent.Position>()
        val tile = game.tiles.first { it.id == position.tile.id }
        "id" to entity.id.id
        "owner" to entity.owner?.id
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
                    is EntityComponent.Control -> Unit
                    is EntityComponent.Settlement -> obj {
                        "type" to "settlement"
                        "name" to component.name
                        "isRealmCapital" to component.isRealmCapital
                    }
                    is EntityComponent.TileImprovement -> obj {
                        "type" to "tile-improvement"
                        "key" to component.key.value
                        "administeringSettlement" to component.administeringSettlement.id
                    }
                }
            }
        ]
    }

    fun route(route: Route) = obj {
        "id" to route.id.id
        "from" to route.from.id
        "to" to route.to.id
        "cost" to route.cost
        "path" to arr[
            route.tiles.map { tile ->
                obj {
                    "id" to tile.id.id
                    "q" to tile.position.q
                    "r" to tile.position.r
                }
            }
        ]
    }

    private fun hidden(visible: Boolean, value: () -> ObjectType?) = obj {
        "visible" to visible
        if (visible) {
            "value" to value()
        }
    }


    private fun getVisibilityAt(gameState: GameStateContext, entity: Entity, realm: Realm.Id): Visibility {
        val position = entity.getComponentOrNull<EntityComponent.Position>()?.tile?.position
            ?: return Visibility.UNDISCOVERED
        return getVisibilityAt(gameState, position, realm)
    }

    private fun getVisibilityAt(gameState: GameStateContext, positions: HexPosition, realm: Realm.Id): Visibility {
        val tile = gameState.tiles.find { it.position == positions }
            ?: return Visibility.UNDISCOVERED
        return getVisibilityAt(tile, realm)
    }

    private fun getVisibilityAt(tile: Tile, realm: Realm.Id): Visibility {
        if (tile.political.ownerRealm == realm) {
            return Visibility.VISIBLE
        }

        val realmControl = tile.political.control.values
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }

        if (realmControl >= settings.visionRequiredControl) {
            return Visibility.VISIBLE
        }

        if (realm in tile.political.discoveredBy) {
            return Visibility.DISCOVERED
        }

        return Visibility.UNDISCOVERED
    }

}
