package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.ConnectToGameError
import io.github.smiley4.strategygame.engine.game.DeleteGameError
import io.github.smiley4.strategygame.engine.game.GameService
import io.github.smiley4.strategygame.engine.game.SubmitTurnError
import io.github.smiley4.strategygame.engine.simulation.SimulationService
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import io.github.smiley4.strategygame.shared.events.GameCreatedEvent
import io.github.smiley4.strategygame.shared.utils.KeyedMutex
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Implementation of [GameService]. Coordinates simulation, persistence, notifications, and event emission.
 */
internal class GameServiceImpl(
    private val simulationService: SimulationService,
    private val gameRepository: GameRepository,
    private val notificationService: GameNotificationService,
    private val eventBus: WritableEventBus
) : GameService {

    companion object {
        val keyedMutex = KeyedMutex()
    }

    override suspend fun create(matchId: MatchId, players: Collection<UserId>): GameId {
        val game = Game(players)
        gameRepository.save(game)
        simulationService.generateGame(game.getId(), players)
        eventBus.emit(
            GameCreatedEvent(
                matchId = matchId,
                gameId = game.getId()
            )
        )
        return game.getId()
    }

    override suspend fun delete(gameId: GameId) {
        keyedMutex.withLock(gameId) {
            val game = gameRepository.findById(gameId)
                ?: throw DeleteGameError.NotFound(gameId.id.toString())
            gameRepository.delete(game)
            simulationService.deleteGame(gameId)
        }
    }

    override suspend fun connect(gameId: GameId, player: UserId) {
        notificationService.getConnectedGames(player).filter { it != gameId }.forEach { gameId ->
            notificationService.disconnect(gameId, player)
        }

        try {

            val game = gameRepository.findById(gameId)
                ?: throw ConnectToGameError.NotFound(gameId.id.toString())

            val playerState = simulationService.buildInitialGameState(game.getId(), player)
            notificationService.sendGameState(gameId, player, playerState)

        } catch (e: Exception) {
            notificationService.disconnect(gameId, player)
            throw e
        }
    }

    override suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw SubmitTurnError.NotFound(gameId.id.toString())

            game.submitTurn(player, commands)

            if (game.isTurnFinished()) {
                val commands = game.getPendingCommands()
                game.nextTurn()
                val playerStates = simulationService.processTurn(game.getId(), commands, notificationService.getConnectedUsers(game.getId()))
                playerStates.forEach { (userId, state) ->
                    notificationService.sendGameState(game.getId(), userId, state)
                }
            }

            gameRepository.save(game)
        }
    }

}
