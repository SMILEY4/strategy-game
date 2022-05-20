package de.ruegnerlukas.strategygame.backend.core.gamelobby

import de.ruegnerlukas.strategygame.backend.core.actions.CreateGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.JoinGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.ListPlayerGameLobbiesActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.ValidateConnectGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.InMemoryGameRepository
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldHaveMinLength

class GameLobbyTest : StringSpec({

	"create a new game-lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val userId = "my-test-user"

		val createLobbyResult = createGameLobby.perform(userId)
		withClue("result of creating lobby should be valid") {
			createLobbyResult.isSuccess() shouldBe true
			createLobbyResult.get() shouldHaveMinLength 1
		}

		val gameState = gameRepository.getGameState(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState.isSuccess() shouldBe true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(GameParticipant.owner(userId))
		}

	}

	"join a new lobby as a participant" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val joinGameLobby = JoinGameLobbyActionImpl(gameRepository)
		val ownerId = "my-test-owner"
		val participantId = "my-test-participant"

		val createLobbyResult = createGameLobby.perform(ownerId)

		val joinLobbyResult = joinGameLobby.perform(participantId, createLobbyResult.get())
		withClue("result of joining lobby should be valid") {
			joinLobbyResult.isSuccess() shouldBe true
		}

		val gameState = gameRepository.getGameState(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState.isSuccess() shouldBe true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(
				GameParticipant.owner(ownerId),
				GameParticipant.participant(participantId)
			)
		}
	}

	"join a lobby already as a participant of that lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val joinGameLobby = JoinGameLobbyActionImpl(gameRepository)
		val ownerId = "my-test-owner"
		val participantId = "my-test-participant"

		val createLobbyResult = createGameLobby.perform(ownerId)
		joinGameLobby.perform(participantId, createLobbyResult.get())

		val joinLobbyResult = joinGameLobby.perform(participantId, createLobbyResult.get())
		withClue("result of joining lobby again should be valid") {
			joinLobbyResult.isSuccess() shouldBe true
		}

		val gameState = gameRepository.getGameState(createLobbyResult.get())
		withClue("saved game-state should be valid") {
			gameState.isSuccess() shouldBe true
			gameState.get().gameId shouldBe createLobbyResult.get()
			gameState.get().participants shouldContainExactlyInAnyOrder listOf(
				GameParticipant.owner(ownerId),
				GameParticipant.participant(participantId)
			)
		}
	}

	"joining a non-existing lobby as a participant" {
		val gameRepository = InMemoryGameRepository()
		val joinGameLobby = JoinGameLobbyActionImpl(gameRepository)
		val userId = "my-test-user"
		val lobbyId = "unknown-game-lobby"

		val joinLobbyResult = joinGameLobby.perform(userId, lobbyId)
		withClue("result of joining lobby should be valid") {
			joinLobbyResult.isError() shouldBe true
			joinLobbyResult.getError() shouldBe "GAME_NOT_FOUND"
		}

		val gameState = gameRepository.getGameState(lobbyId)
		withClue("no game-state should be saved") {
			gameState.isSuccess() shouldBe false
			gameState.getError() shouldBe "GAME_NOT_FOUND:$lobbyId"
		}
	}

	"list game-lobbies of player that is not participating in any" {
		val gameRepository = InMemoryGameRepository()
		val listGameLobbies = ListPlayerGameLobbiesActionImpl(gameRepository)
		val userId = "my-test-user"

		val listLobbiesResult = listGameLobbies.perform(userId)
		withClue("expect result to be valid") {
			listLobbiesResult.isSuccess() shouldBe true
			listLobbiesResult.get() shouldHaveSize 0
		}
	}

	"list game-lobbies of player that is owning and participating in lobbies" {
		val gameRepository = InMemoryGameRepository()
		val listGameLobbies = ListPlayerGameLobbiesActionImpl(gameRepository)
		val joinGameLobby = JoinGameLobbyActionImpl(gameRepository)
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val userId = "my-test-user-1"
		val userIdOther = "my-test-user-2"

		val createLobbyResult1 = createGameLobby.perform(userId)
		val createLobbyResult2 = createGameLobby.perform(userIdOther)
		joinGameLobby.perform(userId, createLobbyResult2.get())

		val listLobbiesResult = listGameLobbies.perform(userId)
		withClue("expect result to be valid") {
			listLobbiesResult.isSuccess() shouldBe true
			listLobbiesResult.get() shouldHaveSize 2
			listLobbiesResult.get() shouldContainExactlyInAnyOrder listOf(createLobbyResult1.get(), createLobbyResult2.get())
		}
	}

	"request to connect to a game lobby" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val connectGameLobby = ValidateConnectGameLobbyActionImpl(gameRepository)
		val userId = "my-test-user"

		val createResult = createGameLobby.perform(userId)
		val connectResult = connectGameLobby.perform(userId, createResult.get())

		withClue("expect result to be successful") {
			connectResult.isSuccess() shouldBe true
		}
	}

	"request to connect to a game lobby without being a participant" {
		val gameRepository = InMemoryGameRepository()
		val createGameLobby = CreateGameLobbyActionImpl(gameRepository)
		val connectGameLobby = ValidateConnectGameLobbyActionImpl(gameRepository)
		val userId1 = "my-test-user-1"
		val userId2 = "my-test-user-2"

		val createResult = createGameLobby.perform(userId1)
		val connectResult = connectGameLobby.perform(userId2, createResult.get())

		withClue("expect result to be failed") {
			connectResult.getError() shouldBe "NOT_PARTICIPANT"
		}
	}


	"request to connect to a game lobby that does not exist" {
		val gameRepository = InMemoryGameRepository()
		val connectGameLobby = ValidateConnectGameLobbyActionImpl(gameRepository)
		val userId = "my-test-user"
		val gameId = "invalid-game-id"

		val connectResult = connectGameLobby.perform(userId, gameId)

		withClue("expect result to be failed") {
			connectResult.getError() shouldBe "GAME_NOT_FOUND:$gameId"
		}
	}

})