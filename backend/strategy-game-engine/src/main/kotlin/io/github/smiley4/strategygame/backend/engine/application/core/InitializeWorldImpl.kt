package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.tracking
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import io.github.smiley4.strategygame.backend.worldgen.lib.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.lib.WorldGenerator

internal class InitializeWorldImpl(private val worldGenerator: WorldGenerator) : InitializeWorld {

    private val metricId = MetricId.action(InitializeWorld::class)

    override suspend fun perform(game: Game, worldSeed: Int?): GameState {
        return time(metricId) {
            val tiles = buildTiles(WorldGenSettings.default(worldSeed))
            buildGameState(game, tiles)
        }
    }

    private fun buildTiles(worldSettings: WorldGenSettings): List<Tile> {
        return worldGenerator.buildTiles(worldSettings).map {
            Tile(
                id = Tile.Id.gen(),
                position = Tile.Position(it.q, it.r),
                discoveredBy = mutableSetOf(),
                dataWorld = Tile.WorldData(
                    terrainType = it.type,
                    resourceType = it.resource,
                    height = it.height,
                ),
            )
        }
    }

    private fun buildGameState(game: Game, tiles: List<Tile>): GameState {
        return GameState(
            game = game,
            tiles = TileContainer(tiles),
            worldObjects = emptyList<WorldObject>().tracking(),
            realms = emptyList<Realm>().tracking(),
        )
    }

}
