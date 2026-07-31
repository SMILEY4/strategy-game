package io.github.smiley4.strategygame.engine.simulation

import com.lectra.koson.ObjectType
import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.generation.WorldGenerator
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.playerstate.PlayerStateBuilder
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.random.Random

/**
 * Handles world generation, turn processing, and player state building.
 */
class SimulationService(
    private val gameStateRepository: GameStateRepository,
    private val worldGenerator: WorldGenerator,
    private val playerStateBuilder: PlayerStateBuilder,
) {

    fun generateGame(gameId: GameId) {
        val tiles = worldGenerator.generate(50, Random.nextInt())
        val gameState = GameStateContext(
            id = gameId,
            turn = 0,
            tiles = tiles
        )
        gameStateRepository.save(gameId, gameState)
    }

    fun deleteGame(gameId: GameId) {
        gameStateRepository.delete(gameId)
    }

    fun buildInitialGameState(gameId: GameId, player: UserId): ObjectType {
        val gameState = gameStateRepository.load(gameId)
            ?: throw ProcessTurnError.NotFound(gameId.id.toString())
        return playerStateBuilder.build(gameState, player)
    }

    fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>, connectedPlayers: Collection<UserId>): Map<UserId, ObjectType> {

        val gameState = gameStateRepository.load(gameId)
            ?: throw ProcessTurnError.NotFound(gameId.id.toString())

        commands.forEach { command ->
            // todo: apply command
        }

        gameState.turn++

        gameStateRepository.save(gameId, gameState)

        val playerStates = connectedPlayers.associateWith { player ->
            playerStateBuilder.build(gameState, player)
        }

        return playerStates
    }

}


/**
 * Errors that can occur while processing a turn.
 */
sealed class ProcessTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : ProcessTurnError("The game '$gameId' could not be found")
}