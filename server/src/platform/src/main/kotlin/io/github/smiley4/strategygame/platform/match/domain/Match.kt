package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.platform.match.DeleteMatchError
import io.github.smiley4.strategygame.platform.match.GenerateGameError
import io.github.smiley4.strategygame.platform.match.JoinMatchError
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.events.GameGenerationRequestedEvent
import io.github.smiley4.strategygame.shared.events.MatchDeletedEvent
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus

/**
 * State of a match. CONFIGURING while players can join, ACTIVE once a game has started.
 */
enum class MatchState {
    CONFIGURING,
    ACTIVE,
}

/**
 * Aggregate for a single match instance. Manages participants, state transitions, and game linkage.
 */
internal class Match private constructor(
    private val id: MatchId,
    private val name: String,
    private val participants: MutableList<MatchParticipant>,
    private var state: MatchState,
    private var gameId: GameId?,
) {

    constructor(name: String, owner: UserId) : this(
        id = MatchId(),
        name = name,
        participants = mutableListOf(MatchParticipant(owner, MatchParticipantRole.OWNER)),
        state = MatchState.CONFIGURING,
        gameId = null
    )

    constructor(snapshot: MatchSnapshot) : this(
        id = snapshot.id,
        name = snapshot.name,
        participants = snapshot.participants.map { MatchParticipant(it.userId, it.role) }.toMutableList(),
        state = snapshot.state,
        gameId = snapshot.gameId
    )

    fun join(user: UserId) {
        if (state != MatchState.CONFIGURING) {
            throw JoinMatchError.WrongMatchState()
        }
        if (participants.any { it.user == user }) {
            throw JoinMatchError.AlreadyMember()
        }
        participants.add(
            MatchParticipant(
                user = user,
                role = MatchParticipantRole.GUEST
            )
        )
    }

    suspend fun delete(user: UserId, eventBus: WritableEventBus) {
        val participant = participants.firstOrNull { it.user == user }
        if (participant == null || participant.role != MatchParticipantRole.OWNER) {
            throw DeleteMatchError.NotAllowed()
        }
        eventBus.emit(
            MatchDeletedEvent(
                gameId = this.gameId
            )
        )
    }

    suspend fun requestGameGeneration(user: UserId, eventBus: WritableEventBus) {
        if (state != MatchState.CONFIGURING) {
            throw GenerateGameError.WrongMatchState()
        }
        val participant = participants.firstOrNull { it.user == user }
        if (participant == null || participant.role != MatchParticipantRole.OWNER) {
            throw GenerateGameError.NotAllowed()
        }
        eventBus.emit(
            GameGenerationRequestedEvent(
                matchId = this.id,
                players = this.participants.map { it.user },
            )
        )
    }

    fun attachGeneratedGame(gameId: GameId) {
        if (state != MatchState.CONFIGURING) {
            throw GenerateGameError.WrongMatchState()
        }
        this.gameId = gameId
        state = MatchState.ACTIVE
    }

    fun isParticipant(user: UserId): Boolean {
        return participants.any { it.user == user }
    }

    fun getId() = id

    fun toSnapshot() = MatchSnapshot(
        id = id,
        name = name,
        participants = participants.map { MatchParticipantSnapshot(it.user, it.role) },
        state = state,
        gameId = gameId,
    )

}