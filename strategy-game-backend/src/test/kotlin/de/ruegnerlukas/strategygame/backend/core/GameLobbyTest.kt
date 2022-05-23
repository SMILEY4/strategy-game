package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbiesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.InMemoryGameRepository
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.of
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeSuccess
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldHaveMinLength

class GameLobbyTest : StringSpec({

	"create a new game-lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val userId = "my-test-user"

		val createLobbyResult = createGameLobby.perform(userId)
		withClue("result of creating lobby should be valid") {
			createLobbyResult shouldBeSuccess true
			createLobbyResult.get() shouldHaveMinLength 1
		}

		val gameState = gameRepository.get(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState shouldBeSuccess true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(PlayerEntity.of(userId))
		}

	}

	"join a new lobby as a participant" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val joinGameLobby = GameLobbyJoinActionImpl(gameRepository)
		val ownerId = "my-test-owner"
		val participantId = "my-test-participant"

		val createLobbyResult = createGameLobby.perform(ownerId)

		val joinLobbyResult = joinGameLobby.perform(participantId, createLobbyResult.get())
		withClue("result of joining lobby should be valid") {
			joinLobbyResult shouldBeSuccess true
		}

		val gameState = gameRepository.get(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState shouldBeSuccess true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(
				PlayerEntity.of(ownerId),
				PlayerEntity.of(participantId)
			)
		}
	}

	"join a lobby already as a participant of that lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val joinGameLobby = GameLobbyJoinActionImpl(gameRepository)
		val ownerId = "my-test-owner"
		val participantId = "my-test-participant"

		val createLobbyResult = createGameLobby.perform(ownerId)
		joinGameLobby.perform(participantId, createLobbyResult.get())

		val joinLobbyResult = joinGameLobby.perform(participantId, createLobbyResult.get())
		withClue("result of joining lobby again should be valid") {
			joinLobbyResult shouldBeSuccess true
		}

		val gameState = gameRepository.get(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState shouldBeSuccess true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(
				PlayerEntity.of(ownerId),
				PlayerEntity.of(participantId)
			)
		}
	}

	"joining a non-existing lobby as a participant" {
		val gameRepository = InMemoryGameRepository()
		val joinGameLobby = GameLobbyJoinActionImpl(gameRepository)
		val userId = "my-test-user"
		val lobbyId = "unknown-game-lobby"

		val joinLobbyResult = joinGameLobby.perform(userId, lobbyId)
		withClue("result of joining lobby should be valid") {
			joinLobbyResult shouldBeError "GAME_NOT_FOUND"
		}

		val gameState = gameRepository.get(lobbyId)
		withClue("no game-state should be saved") {
			gameState shouldBeError "NOT_FOUND"
		}
	}

	"list game-lobbies of player that is not participating in any" {
		val gameRepository = InMemoryGameRepository()
		val listGameLobbies = GameLobbiesListActionImpl(gameRepository)
		val userId = "my-test-user"

		val listLobbiesResult = listGameLobbies.perform(userId)
		withClue("expect result to be valid") {
			listLobbiesResult shouldBeSuccess true
			listLobbiesResult.get() shouldHaveSize 0
		}
	}

	"list game-lobbies of player that is owning and participating in lobbies" {
		val gameRepository = InMemoryGameRepository()
		val listGameLobbies = GameLobbiesListActionImpl(gameRepository)
		val joinGameLobby = GameLobbyJoinActionImpl(gameRepository)
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val userId = "my-test-user-1"
		val userIdOther = "my-test-user-2"

		val createLobbyResult1 = createGameLobby.perform(userId)
		val createLobbyResult2 = createGameLobby.perform(userIdOther)
		joinGameLobby.perform(userId, createLobbyResult2.get())

		val listLobbiesResult = listGameLobbies.perform(userId)
		withClue("expect result to be valid") {
			listLobbiesResult shouldBeSuccess true
			listLobbiesResult.get() shouldHaveSize 2
			listLobbiesResult.get() shouldContainExactlyInAnyOrder listOf(createLobbyResult1.get(), createLobbyResult2.get())
		}
	}

	"request to connect to a game lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val connectGameLobby = GameLobbyRequestConnectionActionImpl(gameRepository)
		val userId = "my-test-user"

		val createResult = createGameLobby.perform(userId)
		val connectResult = connectGameLobby.perform(userId, createResult.get())

		withClue("expect result to be successful") {
			connectResult shouldBeSuccess true
		}
	}

	"request to connect to a game lobby without being a participant" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = GameLobbyCreateActionImpl(gameRepository)
		val connectGameLobby = GameLobbyRequestConnectionActionImpl(gameRepository)
		val userId1 = "my-test-user-1"
		val userId2 = "my-test-user-2"

		val createResult = createGameLobby.perform(userId1)
		val connectResult = connectGameLobby.perform(userId2, createResult.get())

		withClue("expect result to be failed") {
			connectResult shouldBeError "NOT_PARTICIPANT"
		}
	}


	"request to connect to a game lobby that does not exist" {
		val gameRepository = InMemoryGameRepository()
		val connectGameLobby = GameLobbyRequestConnectionActionImpl(gameRepository)
		val userId = "my-test-user"
		val gameId = "invalid-game-id"

		val connectResult = connectGameLobby.perform(userId, gameId)

		withClue("expect result to be failed") {
			connectResult shouldBeError "GAME_NOT_FOUND"
		}
	}

})