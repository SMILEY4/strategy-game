package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player

class PlayerEntity(
    val userId: String,
    var connectionId: Long?,
    var state: String
) {

    companion object {
        fun of(serviceModel: Player) = PlayerEntity(
            userId = serviceModel.userId,
            connectionId = serviceModel.connectionId,
            state = serviceModel.state
        )
    }

    fun asServiceModel() = Player(
        userId = this.userId,
        connectionId = this.connectionId,
        state = this.state
    )

}