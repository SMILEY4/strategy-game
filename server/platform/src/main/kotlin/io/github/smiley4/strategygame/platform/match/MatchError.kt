package io.github.smiley4.strategygame.platform.match

import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId


sealed class MatchError(message: String?, cause: Throwable?) : Exception(message, cause) {
    class NotFound(value: String) : MatchError("The match '$value' could not be found", null)
    class NotAllowed(user: UserId, game: MatchId, operation: String) :
        MatchError("The user '${user.id}' is not allowed to perform operation on match '${game.value}': $operation", null)
    class AlreadyMember(user: UserId, game: MatchId) :
        MatchError("The user '${user.id}' is already a player in match '${game.value}'", null)
    class InvalidMatchState(match: MatchId, state: String, val attemptedOperation: String) :
        MatchError("The operation '$attemptedOperation' failed because the match '${match.value}' is in an invalid state: '${state}'", null)
    class GenerateGameFailed(matchId: MatchId, cause: Throwable?) :
        MatchError("Failed to generate game for match '${matchId.value}'", cause)
}
