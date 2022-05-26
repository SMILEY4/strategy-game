package de.ruegnerlukas.strategygame.backend.ports.models.gamelobby

data class PlayerEntity(
    val userId: String,
    val connection: PlayerConnectionEntity,
    val state: PlayerState
) {
    companion object {
        fun of(userId: String): PlayerEntity {
            return PlayerEntity(userId, PlayerConnectionEntity.disconnected(), PlayerState.PLAYING)
        }
    }
}


enum class PlayerState {
    PLAYING,
    SUBMITTED,
}


enum class ConnectionState {
    CONNECTED,
    DISCONNECTED
}


data class PlayerConnectionEntity(
    val state: ConnectionState,
    val connectionId: Int
) {
    companion object {
        fun disconnected(): PlayerConnectionEntity {
            return PlayerConnectionEntity(ConnectionState.DISCONNECTED, -1)
        }

        fun connected(connectionId: Int): PlayerConnectionEntity {
            return PlayerConnectionEntity(ConnectionState.CONNECTED, connectionId)
        }
    }
}

