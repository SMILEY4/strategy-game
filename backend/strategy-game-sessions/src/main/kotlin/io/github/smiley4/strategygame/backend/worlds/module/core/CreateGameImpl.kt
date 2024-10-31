package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.PlayerContainer
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameInsert
import java.time.Instant

internal class CreateGameImpl(
    private val gameInsert: GameInsert,
    private val initializeWorld: InitializeWorld,
    private val gameExtendedUpdate: GameExtendedUpdate,
) : CreateGame, Logging {

    private val metricId = MetricId.action(CreateGame::class)

    override suspend fun perform(name: String, seed: Int?): Game.Id {
        return time(metricId) {
            log().info("Creating new game with seed $seed")
            val game = createEmpty(name)
            initialize(game, seed)
            log().info("Created new game with id ${game.id}")
            game.id
        }
    }


    /**
     * Build and persist an empty game
     */
    private suspend fun createEmpty(name: String): Game {
        return Game(
            id = Game.Id(DbId.PLACEHOLDER),
            name = name,
            creationTimestamp = Instant.now().toEpochMilli(),
            turn = 0,
            players = PlayerContainer()
        ).let {
            val gameId = gameInsert.execute(it)
            it.copy(id = Game.Id(gameId))
        }
    }


    /**
     * Initialize, populate and persist the world
     */
    private suspend fun initialize(game: Game, worldSeed: Int?) {
        val gameExtended = initializeWorld.perform(game, worldSeed)
        gameExtendedUpdate.execute(gameExtended)
    }

}
