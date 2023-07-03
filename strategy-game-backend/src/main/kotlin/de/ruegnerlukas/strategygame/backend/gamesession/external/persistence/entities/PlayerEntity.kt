package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerState

class PlayerEntity(
    val userId: String,
    var connectionId: Long?,
    var state: String
) {

    companion object {
        fun of(serviceModel: Player) = PlayerEntity(
            userId = serviceModel.userId,
            connectionId = serviceModel.connectionId,
            state = when (serviceModel.state) {
                PlayerState.PLAYING -> "playing"
                PlayerState.SUBMITTED -> "submitted"
            }
        )
    }

    fun asServiceModel() = Player(
        userId = this.userId,
        connectionId = this.connectionId,
        state = when (this.state) {
            "playing" -> PlayerState.PLAYING
            "submitted" -> PlayerState.SUBMITTED
            else -> throw Exception("Invalid player-state: ${this.state}")
        }
    )

}