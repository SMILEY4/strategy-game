package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.DeleteGameError
import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.engine.game.SubmitTurnError
import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.domain.events.GameCreatedEvent
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class GameEngineServiceImpl(
    private val gameRepository: GameRepository,
    private val notificationService: GameNotificationService,
    private val eventBus: WritableEventBus
) : GameEngineService {

    companion object {
        val keyedMutex = KeyedMutex()
    }

    override suspend fun create(matchId: MatchId, players: Collection<UserId>): GameId {
        val game = Game(players)
        gameRepository.save(game)
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
        }
    }

    override fun connect(gameId: GameId, player: UserId) {
        notificationService.connect(gameId, player)
    }

    override fun disconnect(gameId: GameId, player: UserId) {
        notificationService.disconnect(gameId, player)
    }

    override suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw SubmitTurnError.NotFound(gameId.id.toString())

            game.submitTurn(player, commands)

            if (game.isTurnFinished()) {
                game.nextTurn(eventBus)
            }

            gameRepository.save(game)
        }
    }

}
