package io.github.smiley4.strategygame.engine.gameplay.domain

import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.engine.gameplay.ProcessTurnError
import io.github.smiley4.strategygame.engine.gameplay.events.PlayerGameStateEvent
import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus

internal class GameplayEngineImpl(
    private val gameStateRepository: GameStateRepository,
    private val eventBus: WritableEventBus
) : GameplayEngine {

    override suspend fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>) {

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
//            .filter { gameNotificationService.isReachable(gameId, it) }  todo??
            .forEach { userId ->
                val povGameState = """
                    {
                        "player": "$userId",
                        "counter": ${gameState.getCounter()}
                    }
                """.trimIndent()
                eventBus.emit(
                    PlayerGameStateEvent(
                        gameId = gameId,
                        player = userId,
                        state = povGameState,
                    )
                )
            }
    }

}
