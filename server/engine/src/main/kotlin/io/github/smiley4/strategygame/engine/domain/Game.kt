package io.github.smiley4.strategygame.engine.domain

import io.github.smiley4.strategygame.engine.GameError
import io.github.smiley4.strategygame.engine.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

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

    fun submitTurn(player: UserId, commands: List<PlayerCommand>) {
        if(!players.contains(player)) {
            throw GameError.NotParticipant(player, id.toString())
        }
        if(pendingCommands.containsKey(player)) {
            throw GameError.AlreadySubmitted(player, id.toString())
        }
        pendingCommands[player] = commands
    }

    fun nextTurn() {
        currentTurn += 1
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

}