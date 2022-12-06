package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.containers.PlayerContainer
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.trackingListOf

class GameCreateActionImpl(private val gameInsert: GameInsert) : GameCreateAction, Logging {

    private val metricId = metricCoreAction(GameCreateAction::class)

    override suspend fun perform(worldSettings: WorldSettings): String {
        return Monitoring.coTime(metricId) {
            log().info("Creating new game")
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
        return WorldBuilder().buildTiles(worldSettings).map {
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