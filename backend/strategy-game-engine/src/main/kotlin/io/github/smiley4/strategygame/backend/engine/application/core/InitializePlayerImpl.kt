package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer


internal class InitializePlayerImpl() : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameState, userId: User.Id) {
        return time(metricId) {
            val realmId = initRealm(game, userId)
            val spawnTiles = findSpawnLocation(game)
            spawnScout(spawnTiles, game, realmId)
            spawnWorker(spawnTiles, game, realmId)
            spawnWorker(spawnTiles, game, realmId)
        }
    }

    private fun findSpawnLocation(game: GameState): List<Tile.Ref> {

        (1..50).forEach { _ ->

            val spawnLocation = game.tiles.random()

            val validSpawnTiles = getNeighbourPositions(spawnLocation.position)
                .mapNotNull { (q, r) -> game.tiles.get(q, r) }
                .filter { isValidSpawnTile(it) }
                .map { it.ref() }

            if (validSpawnTiles.size < 5) {
                return@forEach
            }

            return validSpawnTiles
        }

        throw Exception("No valid spawn location found")
    }

    private fun isValidSpawnTile(tile: Tile): Boolean {
        return tile.dataWorld.terrainType == TerrainType.LAND
    }

    private fun initRealm(game: GameState, userId: User.Id): Realm.Id {
        val realm = Realm(
            id = Realm.Id.gen(),
            user = userId,
        )
        game.realms.add(realm)
        return realm.id
    }

    private fun spawnScout(spawnTiles: List<Tile.Ref>, game: GameState, realmId: Realm.Id) {
        val spawnLocation = spawnTiles.random()
        val scout = WorldObject(
            id = WorldObject.Id.gen(),
            realmId = realmId,
            type = "scout",
            tile = spawnLocation,
            components = listOf(
                WorldObjectComponent.Movement(
                    maxMovement = 5,
                ),
                WorldObjectComponent.Vision(
                    maxVisionDistance = 3,
                )
            )
        )
        game.worldObjects.add(scout)
    }


    private fun spawnWorker(spawnTiles: List<Tile.Ref>, game: GameState, realmId: Realm.Id) {
        val spawnLocation = spawnTiles.random()
        val worker = WorldObject(
            id = WorldObject.Id.gen(),
            realmId = realmId,
            type = "worker",
            tile = spawnLocation,
            components = listOf(
                WorldObjectComponent.Movement(
                    maxMovement = 4,
                ),
                WorldObjectComponent.Vision(
                    maxVisionDistance = 1,
                )
            )
        )
        game.worldObjects.add(worker)
    }

}