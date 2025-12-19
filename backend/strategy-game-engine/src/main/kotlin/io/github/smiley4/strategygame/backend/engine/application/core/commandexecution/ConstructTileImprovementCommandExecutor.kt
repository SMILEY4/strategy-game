package io.github.smiley4.strategygame.backend.engine.application.core.commandexecution

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.engine.application.core.actions.ConstructRouteAction

class ConstructTileImprovementCommandExecutor(private val constructRouteAction: ConstructRouteAction) : Logging {

    fun execute(gameState: GameState, command: Command<CommandData.ConstructTileImprovement>) {
        log().debug("Executing construct tile improvement command with object ${command.data.worldObject}.")

        // find world object to use for construction
        val worldObject = gameState.worldObjects.find { it.id == command.data.worldObject }
            ?: throw Exception("Could not find world object ${command.data.worldObject}")

        // find tile to build on
        val tile = gameState.tiles.get(worldObject.tile)
            ?: throw Exception("Could not find tile ${worldObject.tile.id}")

        // validate: world object must be owned by player
        val realm = gameState.realms.find { it.id == worldObject.realm }
            ?: throw Exception("Could not find realm ${worldObject.realm}")
        if (realm.user != command.user) {
            throw Exception("Player does not own world object.")
        }

        // validate: no other improvement exists on this tile
        if (gameState.worldObjects.any { it.tile.id == worldObject.tile.id && it.type.group == WorldObject.Group.TILE_IMPROVEMENT }) {
            throw Exception("An improvement already exists at that location.")
        }

        // validate: world object must be able to build
        if (!worldObject.hasComponent<WorldObjectComponent.Builder>()) {
            throw Exception("World object can not build.")
        }

        // validate: location terrain requirements must be met
        if (command.data.improvement.requiredTerrain.isNotEmpty() && tile.dataWorld.terrainType.notContainedIn(command.data.improvement.requiredTerrain)) {
            throw Exception("location terrain requirements not met.")
        }

        // validate: neighbor terrain requirements must be met
        if (command.data.improvement.requiredNeighborTerrain.isNotEmpty() && tile.dataWorld.terrainType.notContainedIn(command.data.improvement.requiredNeighborTerrain)) {
            throw Exception("neighbor terrain requirements not met.")
        }

        // create improvement
        val tileImprovement = WorldObject(
            id = WorldObject.Id.gen(),
            realm = worldObject.realm,
            type = WorldObject.Type(
                group = WorldObject.Group.TILE_IMPROVEMENT,
                name = command.data.improvement.name.lowercase()
            ),
            tile = worldObject.tile,
            components = mutableListOf(
                WorldObjectComponent.Vision(
                    radius = 1,
                ),
                WorldObjectComponent.RouteNote(),
                WorldObjectComponent.SettlementSpawner(),
            )
        )
        gameState.worldObjects.add(tileImprovement)

        // use (and remove) spawner world object
        worldObject.getComponent<WorldObjectComponent.Builder>().also {
            it.remainingUses -= 1
            if (it.remainingUses <= 0) {
                gameState.worldObjects.remove(worldObject)
            }
        }

        // construct routes
        constructRouteAction.onCreateWorldObject(tileImprovement, gameState)
    }

}