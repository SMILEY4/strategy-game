package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.SubmitTurnAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging

class SubmitTurnActionImpl(
	private val repository: GameRepository,
	private val endTurnAction: EndTurnAction
) : SubmitTurnAction, Logging {

	override suspend fun perform(userId: String, connectionId: Int, gameId: String, commands: List<PlaceMarkerCommand>) {
		log().info("Player $userId (connection=$connectionId, world=$gameId) submitted the turn.")

		val newGameState = repository.getGameState(gameId).get()
		newGameState.participants.find { it.userId == userId }!!.currentCommands = commands
		repository.saveGameState(newGameState)

		if (endsTurn(newGameState)) {
			log().info("Ending turn of world $gameId due to last player submitting a turn")
			endTurnAction.perform(gameId)
		}
	}

	private fun endsTurn(gameState: GameState): Boolean {
		return gameState.participants.all { it.currentCommands != null }
	}

}