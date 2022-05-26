package de.ruegnerlukas.strategygame.backend.ports.models.gamelobby

import kotlinx.serialization.Serializable

@Serializable
data class PlayerEntity(
	val userId: String,
	val connection: PlayerConnectionEntity,
	val state: PlayerState
)

fun PlayerEntity.Companion.of(userId: String): PlayerEntity {
	return PlayerEntity(userId, PlayerConnectionEntity.disconnected(), PlayerState.PLAYING)
}


@Serializable
enum class PlayerState {
	PLAYING,
	SUBMITTED,
}


@Serializable
enum class ConnectionState {
	CONNECTED,
	DISCONNECTED
}


@Serializable
data class PlayerConnectionEntity(
	val state: ConnectionState,
	val connectionId: Int
)

fun PlayerConnectionEntity.Companion.disconnected(): PlayerConnectionEntity {
	return PlayerConnectionEntity(ConnectionState.DISCONNECTED, -1)
}

fun PlayerConnectionEntity.Companion.connected(connectionId: Int): PlayerConnectionEntity {
	return PlayerConnectionEntity(ConnectionState.CONNECTED, connectionId)
}
