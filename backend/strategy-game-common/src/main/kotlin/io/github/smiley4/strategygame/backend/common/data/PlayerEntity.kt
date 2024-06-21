package io.github.smiley4.strategygame.backend.common.data

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
                io.github.smiley4.strategygame.backend.common.data.PlayerState.PLAYING -> "playing"
                io.github.smiley4.strategygame.backend.common.data.PlayerState.SUBMITTED -> "submitted"
            }
        )
    }

    fun asServiceModel() = Player(
        userId = this.userId,
        connectionId = this.connectionId,
        state = when (this.state) {
            "playing" -> io.github.smiley4.strategygame.backend.common.data.PlayerState.PLAYING
            "submitted" -> io.github.smiley4.strategygame.backend.common.data.PlayerState.SUBMITTED
            else -> throw Exception("Invalid player-state: ${this.state}")
        }
    )

}