package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorldAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerContainer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.CreateGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameInsert
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

class CreateGameImpl(
    private val gameInsert: GameInsert,
    private val initializeWorld: InitializeWorldAction
) : CreateGame, Logging {

    private val metricId = metricCoreAction(CreateGame::class)

    override suspend fun perform(worldSettings: WorldSettings): String {
        return Monitoring.coTime(metricId) {
            log().info("Creating new game with seed ${worldSettings.seed}")
            val gameId = createGame()
            initializeWorld.perform(gameId, worldSettings)
            log().info("Created new game with id $gameId")
            gameId
        }
    }


    /**
     * Build and persist the game entity
     */
    private suspend fun createGame(): String {
        return gameInsert.execute(
            Game(
                gameId = DbId.PLACEHOLDER,
                turn = 0,
                players = PlayerContainer()
            )
        )
    }

}