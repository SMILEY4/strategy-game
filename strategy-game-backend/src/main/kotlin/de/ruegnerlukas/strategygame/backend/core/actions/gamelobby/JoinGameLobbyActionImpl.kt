package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.JoinGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

class JoinGameLobbyActionImpl(private val gameRepository: GameRepository) : JoinGameLobbyAction {

	override fun perform(userId: String, gameId: String): VoidResult {
		val gameStateResult = gameRepository.getGameState(gameId)
		if (gameStateResult.isError()) {
			return VoidResult.error("GAME_NOT_FOUND")
		}
		val gameState = gameStateResult.get()

		val newGameState = GameState(
			gameId = gameState.gameId,
			createdTimestamp = gameState.createdTimestamp,
			participants = addParticipant(gameState.participants, GameParticipant.participant(userId)),
			map = gameState.map
		)
		gameRepository.saveGameState(newGameState)
		return VoidResult.success()
	}


	private fun addParticipant(participants: List<GameParticipant>, participant: GameParticipant): List<GameParticipant> {
		if (participants.find { it.userId == participant.userId } != null) {
			return participants
		} else {
			val list = mutableListOf<GameParticipant>()
			list.addAll(participants)
			list.add(participant)
			return list
		}
	}

}