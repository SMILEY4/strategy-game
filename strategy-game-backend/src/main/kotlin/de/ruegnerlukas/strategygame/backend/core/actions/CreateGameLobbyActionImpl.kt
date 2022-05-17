package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import org.joda.time.Instant
import java.util.UUID

class CreateGameLobbyActionImpl(private val gameRepository: GameRepository) : CreateGameLobbyAction, Logging {

	override fun perform(userId: String): Result<String> {
		val state = GameState(
			gameId = generateGameId(),
			createdTimestamp = Instant.now().millis,
			participants = listOf(GameParticipant.owner(userId))
		)
		return gameRepository.saveGameState(state).mapToResult(
			{ Result.success(state.gameId) },
			{ Result.error("FAILED_WRITE") }
		)
	}

	private fun generateGameId(): String = UUID.randomUUID()!!.toString()

}