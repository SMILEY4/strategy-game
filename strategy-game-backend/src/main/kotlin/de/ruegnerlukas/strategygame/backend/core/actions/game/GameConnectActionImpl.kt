package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.GameConnectActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastInitialGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerConnection
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameConnectActionImpl(
	private val actionBroadcastWorldState: BroadcastInitialGameStateAction,
	private val queryPlayer: QueryPlayer,
	private val updatePlayerConnection: UpdatePlayerConnection,
) : GameConnectAction, Logging {

	override suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<GameConnectActionError, Unit> {
		log().info("Connect user $userId ($connectionId) to game $gameId")
		return either {
			val player = findPlayer(userId, gameId).bind()
			setConnection(player, connectionId)
			sendInitialGameStateMessage(connectionId, gameId)
		}
	}


	/**
	 * Find and return the player or an [NotParticipantError] if the player does not exist
	 */
	private suspend fun findPlayer(userId: String, gameId: String): Either<NotParticipantError, PlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}


	/**
	 * Write the new connection of the player to the db.
	 */
	private suspend fun setConnection(player: PlayerEntity, connectionId: Int) {
		updatePlayerConnection.execute(player.id, connectionId)
	}


	/**
	 * Send the initial game-state to the player
	 * */
	private suspend fun sendInitialGameStateMessage(connectionId: Int, gameId: String) {
		actionBroadcastWorldState.perform(gameId, listOf(connectionId))
			.getOrElse { throw Exception("Could not find game when sending game-state-messages") }
	}

}