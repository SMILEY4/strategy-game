package io.github.smiley4.strategygame.engine.game

import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Service for managing game lifecycle and turn submission.
 */
interface GameService {
    /**
     * Connect a player to a game, triggering the initial game state push over WebSocket.
     */
    suspend fun connect(gameId: GameId, player: UserId)
    /**
     * Create a new game for the given match and players.
     */
    suspend fun create(matchId: MatchId, players: Collection<UserId>): GameId
    /**
     * Delete a game and its simulation state.
     */
    suspend fun delete(gameId: GameId)
    /**
     * Submit a list of commands for a player's turn. When all players have submitted,
     * the turn is processed and new game states are pushed.
     */
    suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>)
}


/**
 * Errors that can occur during game creation.
 */
sealed class CreateGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    // ...
}

/**
 * Errors that can occur when deleting a game.
 */
sealed class DeleteGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : DeleteGameError("The game '$gameId' could not be found")
}

/**
 * Errors that can occur when connecting to a game.
 */
sealed class ConnectToGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : ConnectToGameError("The game '$gameId' could not be found")
}

/**
 * Errors that can occur when submitting a turn.
 */
sealed class SubmitTurnError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(gameId: String) : SubmitTurnError("The game '$gameId' could not be found")
    class NotParticipant : SubmitTurnError("The player is not a participant of the game")
    class AlreadySubmitted : SubmitTurnError("The player has already submitted their turn")
}
