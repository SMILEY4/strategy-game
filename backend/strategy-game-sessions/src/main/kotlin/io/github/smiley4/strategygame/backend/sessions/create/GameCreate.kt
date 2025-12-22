package io.github.smiley4.strategygame.backend.sessions.create

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.utils.DbId
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import java.time.Instant

internal class GameCreate(
    private val gameDbInsert: GameDbInsert,
    private val gameDbStateUpdate: GameDbStateUpdate,
    private val initializeWorld: InitializeWorld
) : Logging {

    private val metricId = MetricId.action(GameCreate::class)

    suspend fun create(name: String, seed: Int?): Game.Id {
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
            players = Player.Container()
        ).let {
            val gameId = gameDbInsert.insert(it)
            it.copy(id = Game.Id(gameId))
        }
    }


    /**
     * Initialize, populate and persist the world
     */
    private suspend fun initialize(game: Game, worldSeed: Int?) {
        val gameExtended = initializeWorld.perform(game, worldSeed)
        gameDbStateUpdate.update(gameExtended)
    }

}