package io.github.smiley4.strategygame.platform.match

import io.github.smiley4.strategygame.platform.match.domain.MatchSnapshot
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId


/**
 * Service for managing match lifecycle and participation.
 */
interface MatchService {
    /**
     * Create a new match with the given name. The creating user becomes the owner.
     */
    fun create(user: UserId, name: String): MatchId
    /**
     * Join an existing match that is still in CONFIGURING state.
     */
    suspend fun join(user: UserId, matchId: MatchId)
    /**
     * Delete a match. Only the owner is allowed.
     */
    suspend fun delete(user: UserId, matchId: MatchId)
    /**
     * Request game generation for a match. Only the owner is allowed.
     */
    suspend fun generateGame(user: UserId, matchId: MatchId)
    /**
     * Attach a generated game to a match and transition to ACTIVE state.
     */
    suspend fun attachGame(matchId: MatchId, gameId: GameId)
    /**
     * List all matches the given user participates in.
     */
    fun listMatches(user: UserId): List<MatchSnapshot>
    /**
     * Get details of a specific match.
     */
    fun getMatchDetails(user: UserId, matchId: MatchId): MatchSnapshot
}

/**
 * Errors that can occur when joining a match.
 */
sealed class JoinMatchError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : JoinMatchError("The match '$value' could not be found")
    class WrongMatchState : JoinMatchError("The match is in the wrong state")
    class AlreadyMember : JoinMatchError("The user has already joined the match")
}


/**
 * Errors that can occur when deleting a match.
 */
sealed class DeleteMatchError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : DeleteMatchError("The match '$value' could not be found")
    class NotAllowed : DeleteMatchError("The user is not allowed to delete the match")
}


/**
 * Errors that can occur when generating a game for a match.
 */
sealed class GenerateGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : GenerateGameError("The match '$value' could not be found")
    class WrongMatchState : GenerateGameError("The match is in the wrong state")
    class NotAllowed : GenerateGameError("The user is not allowed to generate the game")
}


/**
 * Errors that can occur when fetching match details.
 */
sealed class GetMatchDetailsError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : GetMatchDetailsError("The match '$value' could not be found")
}