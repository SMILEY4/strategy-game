package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.core.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import java.util.UUID

class CreateGameLobbyActionImpl(private val gameRepository: GameRepository) : CreateGameLobbyAction {

	override fun perform(userId: String): Result<String> {
		val state = createBaseGameState(userId)
		return gameRepository.saveGameState(state).mapToResult(
			{ Result.success(state.gameId) },
			{ Result.error("FAILED_WRITE") }
		)
	}

	private fun createBaseGameState(userId: String): GameState {
		return GameState(
			gameId = generateGameId(),
			participants = listOf(GameParticipant.owner(userId)),
			map = generateMap(),
			markers = listOf()
		)
	}

	private fun generateGameId(): String = UUID.randomUUID()!!.toString()

	private fun generateMap() = TilemapBuilder().build()

}