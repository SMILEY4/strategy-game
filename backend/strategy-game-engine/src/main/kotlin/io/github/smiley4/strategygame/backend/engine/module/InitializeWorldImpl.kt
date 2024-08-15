package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.GameMeta
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.TilePoliticalData
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.commondata.TileWorldData
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.tracking
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator

internal class InitializeWorldImpl(private val worldGenerator: WorldGenerator) : InitializeWorld {

    private val metricId = MetricId.action(InitializeWorld::class)

    override suspend fun perform(game: Game, worldSeed: Int?): GameExtended {
        return time(metricId) {
            val tiles = buildTiles(WorldGenSettings.default(worldSeed))
            buildGameExtended(game, tiles)
        }
    }


    private fun buildTiles(worldSettings: WorldGenSettings): List<Tile> {
        return worldGenerator.buildTiles(worldSettings).map {
            Tile(
                tileId = DbId.PLACEHOLDER,
                position = TilePosition(it.q, it.r),
                dataWorld = TileWorldData(
                    terrainType = it.type,
                    resourceType = it.resource,
                    height = it.height,
                ),
                dataPolitical = TilePoliticalData(
                    discoveredByCountries = mutableSetOf(),
                    influences = mutableListOf(),
                    owner = null,
                ),
            )
        }
    }

    private fun buildGameExtended(game: Game, tiles: List<Tile>): GameExtended {
        return GameExtended(
            meta = GameMeta(
                gameId = game.gameId,
                turn = game.turn
            ),
            tiles = TileContainer(tiles),
            worldObjects = emptyList<WorldObject>().tracking(),
            countries = emptyList<Country>().tracking(),
            settlements = emptyList<Settlement>().tracking(),
            provinces = emptyList<Province>().tracking(),
//            routes = emptyList<Route>().tracking()
        )
    }

}
