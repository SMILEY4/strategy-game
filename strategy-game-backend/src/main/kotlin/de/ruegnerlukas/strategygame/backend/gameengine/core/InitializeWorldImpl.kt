package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.trackingListOf
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorld
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorld.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorld.InitializeWorldError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesInsert
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilder
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

class InitializeWorldImpl(
    private val worldBuilder: WorldBuilder,
    private val tileInsert: TilesInsert,
    private val gameExistsQuery: GameExistsQuery
) : InitializeWorld {

    private val metricId = MetricId.action(InitializeWorld::class)

    override suspend fun perform(gameId: String, worldSettings: WorldSettings): Either<InitializeWorldError, Unit> {
        return time(metricId) {
            either {
                validateGame(gameId).bind()
                val tiles = buildTiles(worldSettings)
                saveTiles(tiles, gameId)
            }
        }
    }

    private suspend fun validateGame(gameId: String): Either<GameNotFoundError, Unit> {
        return if (gameExistsQuery.perform(gameId)) {
            Unit.ok()
        } else {
            GameNotFoundError.err()
        }
    }

    private fun buildTiles(worldSettings: WorldSettings): List<Tile> {
        return worldBuilder.buildTiles(worldSettings).map {
            Tile(
                tileId = DbId.PLACEHOLDER,
                position = TilePosition(it.q, it.r),
                data = TileData(
                    terrainType = it.type,
                    resourceType = it.resource
                ),
                content = trackingListOf(),
                influences = mutableListOf(),
                owner = null,
                discoveredByCountries = mutableListOf()
            )
        }
    }

    private suspend fun saveTiles(tiles: List<Tile>, gameId: String) {
        tileInsert.insert(tiles, gameId)
    }

}