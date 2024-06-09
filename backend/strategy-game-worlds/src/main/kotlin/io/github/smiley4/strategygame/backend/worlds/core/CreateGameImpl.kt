package io.github.smiley4.strategygame.backend.worlds.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.DbId
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import io.github.smiley4.strategygame.backend.worldgen.provided.WorldGenSettings
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.common.models.PlayerContainer
import io.github.smiley4.strategygame.backend.worlds.ports.provided.CreateGame
import io.github.smiley4.strategygame.backend.worlds.ports.required.GameInsert
import java.time.Instant

class CreateGameImpl(
    private val gameInsert: GameInsert,
    private val initializeWorld: InitializeWorld
) : CreateGame, Logging {

    private val metricId = MetricId.action(CreateGame::class)

    override suspend fun perform(name: String, worldSettings: WorldGenSettings): String {
        return time(metricId) {
            log().info("Creating new game with seed ${worldSettings.seed}")
            val gameId = createGame(name)
            initializeWorld(gameId, worldSettings)
            log().info("Created new game with id $gameId")
            gameId
        }
    }


    /**
     * Build and persist the game
     */
    private suspend fun createGame(name: String): String {
        return gameInsert.execute(
            Game(
                gameId = DbId.PLACEHOLDER,
                name = name,
                creationTimestamp = Instant.now().toEpochMilli(),
                turn = 0,
                players = PlayerContainer()
            )
        )
    }


    /**
     * Initialize and populate the world
     */
    private suspend fun initializeWorld(gameId: String, worldSettings: WorldGenSettings) {
        try {
        initializeWorld.perform(gameId, worldSettings)
        } catch (e: Exception) {
            throw CreateGame.WorldInitError()
        }
    }

}