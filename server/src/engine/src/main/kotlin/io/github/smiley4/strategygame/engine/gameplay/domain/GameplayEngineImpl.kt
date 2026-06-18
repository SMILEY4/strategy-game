package io.github.smiley4.strategygame.engine.gameplay.domain

import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.engine.gameplay.ProcessTurnError
import io.github.smiley4.strategygame.engine.gameplay.domain.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.gameplay.domain.generation.WorldGenerator
import io.github.smiley4.strategygame.engine.gameplay.events.PlayerGameStateEvent
import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.random.Random

internal class GameplayEngineImpl(
    private val worldGenerator: WorldGenerator,
    private val gameStateRepository: GameStateRepository,
    private val eventBus: WritableEventBus
) : GameplayEngine {

    override fun createGameState(gameId: GameId) {
        val tiles = worldGenerator.generate(50, Random.nextInt())
        val gameState = GameStateContext(
            tiles = tiles
        )
        gameStateRepository.save(gameId, gameState)
    }

    override suspend fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>, connectedPlayers: Collection<UserId>) {

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
        connectedPlayers
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
