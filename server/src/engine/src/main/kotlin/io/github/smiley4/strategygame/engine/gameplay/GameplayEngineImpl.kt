package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.domain.GameplayEngine
import io.github.smiley4.strategygame.engine.domain.ProcessTurnError
import io.github.smiley4.strategygame.engine.gameplay.data.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId

internal class GameplayEngineImpl(
    private val gameStateRepository: GameStateRepository,
    private val gameNotificationService: GameNotificationService
) : GameplayEngine {

    override fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>) {

        // load game state
        val gameState = gameStateRepository.load(gameId)
            ?: throw ProcessTurnError.NotFound(gameId.id.toString())

        // apply commands
        commands.forEach { command ->
            when (command) {
                is PlayerCommand.Increment -> gameState.getCounter().increment()
                is PlayerCommand.Decrement -> gameState.getCounter().decrement()
            }
        }

        // persist updated game state
        gameStateRepository.save(gameId, gameState)

        // send new game state to players
        gameState.getPlayers()
            .filter { gameNotificationService.isReachable(gameId, it) }
            .forEach { userId ->
                val povGameState = """
                    {
                        "player": "$userId",
                        "counter": ${gameState.getCounter()}
                    }
                """.trimIndent()
                gameNotificationService.send(gameId, userId, povGameState)

            }
    }

}
