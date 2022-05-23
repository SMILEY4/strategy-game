package de.ruegnerlukas.strategygame.backend.ports.models.new

import de.ruegnerlukas.strategygame.backend.ports.models.game.Tilemap
import kotlinx.serialization.Serializable


@Serializable
data class GameLobbyEntity(
	val gameId: String,
	val participants: List<PlayerEntity>,
	val world: WorldEntity,
	val commands: List<CommandAddMarkerEntity>
)


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


@Serializable
data class CommandAddMarkerEntity(
	val userId: String,
	val q: Int,
	val r: Int,
)


@Serializable
data class WorldEntity(
	val map: Tilemap,
	val markers: List<MarkerEntity>
)


@Serializable
data class MarkerEntity(
	val userId: String,
	val q: Int,
	val r: Int,
)