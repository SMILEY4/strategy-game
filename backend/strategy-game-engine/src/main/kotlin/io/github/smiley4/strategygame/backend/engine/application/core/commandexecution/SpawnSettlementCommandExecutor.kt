package io.github.smiley4.strategygame.backend.engine.application.core.commandexecution

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.ResourceStorage
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

class SpawnSettlementCommandExecutor() : Logging {

    fun execute(gameState: GameState, command: Command<CommandData.SpawnSettlement>) {
        log().debug("Executing spawn settlement command with object ${command.data.worldObject}.")

        // find world object to use
        val worldObject = gameState.worldObjects.find { it.id == command.data.worldObject }
            ?: throw Exception("Could not find world object ${command.data.worldObject}")

        // find tile to spawn on
        val tile = gameState.tiles.get(worldObject.tile)
            ?: throw Exception("Could not find tile ${worldObject.tile.id}")

        // validate: world object must be owned by player
        val realm = gameState.realms.find { it.id == worldObject.realm }
            ?: throw Exception("Could not find realm ${worldObject.realm}")
        if (realm.user != command.user) {
            throw Exception("Player does not own world object.")
        }

        // validate: no other settlement exists on this tile
        if (gameState.worldObjects.any { it.tile.id == worldObject.tile.id && it.type.group == WorldObject.Group.SETTLEMENT }) {
            throw Exception("A settlement already exists at that location.")
        }

        // validate: world object must be able to spawn settlement
        if (!worldObject.hasComponent<WorldObjectComponent.SettlementSpawner>()) {
            throw Exception("World object can not spawn settlement.")
        }

        // validate: tile position must be valid (same tile or neighbor)
        if (command.data.tile.position.notContainedIn(positionsCircle(worldObject.tile, 1))) {
            throw Exception("Spawn position invalid.")
        }

        // validate: location terrain requirements must be met
        if (tile.dataWorld.terrainType.notContainedIn(setOf(TerrainType.LAND, TerrainType.MOUNTAIN))) {
            throw Exception("location terrain requirements not met.")
        }

        // remove spawner from world object
        worldObject.components.removeIf { it is WorldObjectComponent.SettlementSpawner }

        // create settlement
        val settlement = WorldObject(
            id = WorldObject.Id.gen(),
            realm = worldObject.realm,
            type = WorldObject.Type(
                group = WorldObject.Group.SETTLEMENT,
                name = command.data.settlementName
            ),
            tile = command.data.tile,
            components = mutableListOf(
                WorldObjectComponent.Vision(
                    radius = 1,
                ),
                WorldObjectComponent.RouteNote(
                    maxRouteConnectionDistance = 10
                ),
                WorldObjectComponent.Economy(
                    storage = ResourceStorage(),
                    entries = mutableListOf(
                        WorldObjectComponent.Economy.Entry(
                            name = "population",
                            consumes = mapOf(
                                ResourceType.FISH to 2.0,
                            ),
                            produces = mapOf()
                        )
                    ),
                    log = mutableListOf()
                ),
            )
        )
        gameState.worldObjects.add(settlement)
    }

}