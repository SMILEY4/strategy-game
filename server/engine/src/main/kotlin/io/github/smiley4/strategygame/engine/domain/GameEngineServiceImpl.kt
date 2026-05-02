package io.github.smiley4.strategygame.engine.domain

import io.github.smiley4.strategygame.engine.DeleteGameError
import io.github.smiley4.strategygame.engine.GameEngineService
import io.github.smiley4.strategygame.engine.PlayerCommand
import io.github.smiley4.strategygame.engine.SubmitTurnError
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class GameEngineServiceImpl(
    private val gameplayEngine: GameplayEngine,
    private val gameRepository: GameRepository
) : GameEngineService {

    companion object {
        val keyedMutex = KeyedMutex()
    }

    override fun create(players: Collection<UserId>): GameId {
        val game = Game(players)
        gameRepository.save(game)
        return game.getId()
    }

    override suspend fun delete(gameId: GameId) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw DeleteGameError.NotFound(gameId.id.toString())

            gameRepository.delete(game)
        }
    }

    override suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw SubmitTurnError.NotFound(gameId.id.toString())

            game.submitTurn(player, commands)

            if (game.isTurnFinished()) {
                gameplayEngine.processTurn(game.getId(), game.getPendingCommands())
                game.nextTurn()
            }

            gameRepository.save(game)
        }
    }

}