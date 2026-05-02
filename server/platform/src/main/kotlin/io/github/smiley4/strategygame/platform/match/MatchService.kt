package io.github.smiley4.strategygame.platform.match

import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId


interface MatchService {
    fun create(user: UserId, name: String): MatchId
    suspend fun join(user: UserId, matchId: MatchId)
    suspend fun delete(user: UserId, matchId: MatchId)
    suspend fun generateGame(user: UserId, matchId: MatchId)
    fun listMatches(user: UserId): List<MatchId>
}

sealed class CreateMatchError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
}

sealed class JoinMatchError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : JoinMatchError("The match '$value' could not be found")
    class WrongMatchState : JoinMatchError("The match is in the wrong state")
    class AlreadyMember : JoinMatchError("The user has already joined the match")
}


sealed class DeleteMatchError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : DeleteMatchError("The match '$value' could not be found")
    class NotAllowed : DeleteMatchError("The user is not allowed to delete the match")
}


sealed class GenerateGameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class NotFound(value: String) : GenerateGameError("The match '$value' could not be found")
    class WrongMatchState : GenerateGameError("The match is in the wrong state")
    class NotAllowed : GenerateGameError("The user is not allowed to generate the game")
}


sealed class ListMatchesError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
}
