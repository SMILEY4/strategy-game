package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.User

internal class PlayerEntity(
    val userId: String,
    var connectionId: Long?,
    var state: String
) {

    companion object {
        fun of(serviceModel: Player) = PlayerEntity(
            userId = serviceModel.user.value,
            connectionId = serviceModel.connectionId,
            state = when (serviceModel.state) {
                Player.State.PLAYING -> "playing"
                Player.State.SUBMITTED -> "submitted"
            }
        )
    }

    fun asServiceModel() = Player(
        user = User.Id(this.userId),
        connectionId = this.connectionId,
        state = when (this.state) {
            "playing" -> Player.State.PLAYING
            "submitted" -> Player.State.SUBMITTED
            else -> throw Exception("Invalid player-state: ${this.state}")
        }
    )

}