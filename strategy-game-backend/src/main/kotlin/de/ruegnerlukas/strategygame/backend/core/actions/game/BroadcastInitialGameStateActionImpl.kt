package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastInitialGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastInitialGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastInitialGameStateAction.WorldStateBroadcasterActionError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class BroadcastInitialGameStateActionImpl(
	private val gameExtendedQuery: GameExtendedQuery,
	private val messageProducer: GameMessageProducer,
) : BroadcastInitialGameStateAction, Logging {

	override suspend fun perform(gameId: String, connectionIds: List<Int>): Either<WorldStateBroadcasterActionError, Unit> {
		log().info("Sending world-state of game $gameId to connected player(s)")
		return either {
			val game = findGame(gameId).bind()
			sendGameStateMessages(connectionIds, game)
		}
	}


	/**
	 * Find and return the game or a [GameEntity] if a game with that id does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameExtendedEntity> {
		return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Send the new game-state to the connected players
	 */
	private suspend fun sendGameStateMessages(connectionIds: List<Int>, game: GameExtendedEntity) {
		connectionIds.forEach { connectionId ->
			messageProducer.sendWorldState(connectionId, game)
		}
	}

}