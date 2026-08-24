package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.SubmitTurnError
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import net.logstash.logback.stacktrace.StackElementFilter.any

/**
 * Aggregate for a single game instance. Tracks players and pending turn commands.
 */
class Game private constructor(
    private val id: GameId,
    private val players: Set<UserId>,
    private val pendingCommands: MutableMap<UserId, List<PlayerCommand>>
) {

    constructor(participants: Collection<UserId>) : this(
        id = GameId(),
        players = participants.toSet(),
        pendingCommands = mutableMapOf()
    )

    constructor(snapshot: GameSnapshot) : this(
        id = snapshot.id,
        players = snapshot.players,
        pendingCommands = snapshot.pendingCommands.toMutableMap()
    )

    fun submitTurn(player: UserId, commands: List<PlayerCommand>) {
        if (!players.contains(player)) {
            throw SubmitTurnError.NotParticipant()
        }
        if (pendingCommands.containsKey(player)) {
            throw SubmitTurnError.AlreadySubmitted()
        }
        if (commands.any { it.playerId != player }) {
            throw SubmitTurnError.InvalidCommandUser()
        }
        pendingCommands[player] = commands
    }

    fun nextTurn() {
        pendingCommands.clear()
    }

    fun isTurnFinished(): Boolean {
        return pendingCommands.size == players.size
    }

    fun isParticipant(user: UserId): Boolean {
        return user in players
    }

    fun getPendingCommands(): List<PlayerCommand> {
        return this.pendingCommands.flatMap { it.value }
    }

    fun getId(): GameId {
        return id
    }

    fun toSnapshot() = GameSnapshot(
        id = this.id,
        players = this.players,
        pendingCommands = this.pendingCommands.toMutableMap()
    )

}
