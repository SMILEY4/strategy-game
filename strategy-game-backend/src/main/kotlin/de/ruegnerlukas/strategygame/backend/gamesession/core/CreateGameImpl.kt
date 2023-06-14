package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileData
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import de.ruegnerlukas.strategygame.backend.common.models.PlayerContainer
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.models.trackingListOf
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.CreateGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameInsert
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilderImpl

class CreateGameImpl(private val gameInsert: GameInsert) : CreateGame, Logging {

    private val metricId = metricCoreAction(CreateGame::class)

    override suspend fun perform(worldSettings: WorldSettings): String {
        return Monitoring.coTime(metricId) {
            log().info("Creating new game with seed ${worldSettings.seed}")
            val game = buildGame()
            val tiles = buildTiles(worldSettings)
            val gameId = save(game, tiles)
            log().info("Created new game with id $gameId")
            gameId
        }
    }

    /**
     * Build the game entity
     */
    private fun buildGame(): Game {
        return Game(
            gameId = DbId.PLACEHOLDER,
            turn = 0,
            players = PlayerContainer()
        )
    }

    /**
     * Build the tile entities
     */
    private fun buildTiles(worldSettings: WorldSettings): List<Tile> {
        return WorldBuilderImpl().buildTiles(worldSettings).map {
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

    /**
     * Write the given game entity to the database
     */
    private suspend fun save(game: Game, tiles: List<Tile>): String {
        return gameInsert.execute(game, tiles)
    }

}