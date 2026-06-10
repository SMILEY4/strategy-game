package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.engine.game.SubmitTurnError
import io.github.smiley4.strategygame.engine.shared.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.engine.game.events.EndTurnEvent
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus

class Game private constructor(
    private val id: GameId,
    private val players: Set<UserId>,
    private var currentTurn: Int,
    private val pendingCommands: MutableMap<UserId, List<PlayerCommand>>
) {

    constructor(participants: Collection<UserId>) : this(
        id = GameId(),
        players = participants.toSet(),
        currentTurn = 0,
        pendingCommands = mutableMapOf()
    )

    constructor(snapshot: GameSnapshot) : this(
        id = snapshot.id,
        players = snapshot.players,
        currentTurn = snapshot.currentTurn,
        pendingCommands = snapshot.pendingCommands.toMutableMap()
    )

    fun submitTurn(player: UserId, commands: List<PlayerCommand>) {
        if (!players.contains(player)) {
            throw SubmitTurnError.NotParticipant()
        }
        if (pendingCommands.containsKey(player)) {
            throw SubmitTurnError.AlreadySubmitted()
        }
        pendingCommands[player] = commands
    }

    suspend fun nextTurn(eventBus: WritableEventBus) {
        currentTurn += 1
        eventBus.emit(
            EndTurnEvent( // todo: order of operations is weird with publishing in general: 1. load aggregate 2. call aggregate, 2a. modify aggregate, 2b, publish event, 3. persist modified aggregate => at time of event still old aggregate in db
                gameId = this.id,
                commands = this.pendingCommands.flatMap { it.value }
            )
        )
        pendingCommands.clear()
    }

    fun isTurnFinished(): Boolean {
        return pendingCommands.size == players.size
    }

    fun getId(): GameId {
        return id
    }

    fun getPendingCommands(): List<PlayerCommand> {
        return pendingCommands.values.flatten()
    }

    fun toSnapshot() = GameSnapshot(
        id = this.id,
        players = this.players,
        currentTurn = this.currentTurn,
        pendingCommands = this.pendingCommands.toMutableMap()
    )

}
