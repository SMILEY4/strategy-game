package io.github.smiley4.strategygame.engine.simulation

import com.lectra.koson.ObjectType
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.generation.WorldGenerator
import io.github.smiley4.strategygame.engine.simulation.playerstate.PlayerStateBuilder
import io.github.smiley4.strategygame.engine.simulation.turn.TurnService
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.collections.associateWith

/**
 * Handles world generation, turn processing, and player state building.
 */
internal class SimulationService(
    private val gameStateRepository: GameStateRepository,
    private val worldGenerator: WorldGenerator,
    private val playerStateBuilder: PlayerStateBuilder,
    private val turnService: TurnService
) {

    fun generateGame(gameId: GameId, players: Collection<UserId>) {
        val gameState = worldGenerator.generate(gameId, players)
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

        turnService.execute(gameState, commands)

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