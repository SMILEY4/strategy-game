package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.core.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import org.joda.time.Instant
import java.util.UUID

class CreateGameLobbyActionImpl(private val gameRepository: GameRepository) : CreateGameLobbyAction {

	override fun perform(userId: String): Result<String> {
		val state = GameState(
			gameId = generateGameId(),
			createdTimestamp = Instant.now().millis,
			participants = listOf(GameParticipant.owner(userId)),
			map = generateMap()
		)
		return gameRepository.saveGameState(state).mapToResult(
			{ Result.success(state.gameId) },
			{ Result.error("FAILED_WRITE") }
		)
	}

	private fun generateGameId(): String = UUID.randomUUID()!!.toString()

	private fun generateMap() = TilemapBuilder().build()

}