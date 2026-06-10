package io.github.smiley4.strategygame.engine.game

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId

interface GameEngineService {
    suspend fun create(matchId: MatchId, players: Collection<UserId>): GameId
    suspend fun delete(gameId: GameId)
    fun connect(gameId: GameId, player: UserId)
    fun disconnect(gameId: GameId, player: UserId)
    suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>)
}


sealed class CreateGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    // ...
}

sealed class DeleteGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : DeleteGameError("The game '$gameId' could not be found")
}

sealed class SubmitTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : SubmitTurnError("The game '$gameId' could not be found")
    class NotParticipant : SubmitTurnError("The player is not a participant of the game")
    class AlreadySubmitted : SubmitTurnError("The player has already submitted their turn")

}
