package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.PlayerContainer
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.module.client.InitializeWorld
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameInsert
import java.time.Instant

internal class CreateGameImpl(
    private val gameInsert: GameInsert,
    private val initializeWorld: InitializeWorld
) : CreateGame, Logging {

    private val metricId = MetricId.action(CreateGame::class)

    override suspend fun perform(name: String, seed: Int?): String {
        return time(metricId) {
            log().info("Creating new game with seed $seed")
            val gameId = createGame(name)
            initializeWorld(gameId, WorldGenSettings.default(seed))
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