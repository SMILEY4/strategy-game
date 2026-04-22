package io.github.smiley4.strategygame.platform

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.GameError
import io.github.smiley4.strategygame.platform.game.domain.GameId
import io.github.smiley4.strategygame.platform.game.domain.GameServiceImpl
import io.github.smiley4.strategygame.platform.game.infrastructure.InMemoryGameRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder

class GameTests : FreeSpec({

    "creating games is possible" {
        val service = GameServiceImpl(InMemoryGameRepository())

        val userId = UserId()
        val gameId1 = service.create(userId, "Test Game 1")
        val gameId2 = service.create(userId, "Test Game 2")

        service.listGames(userId) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
    }

    "joining game" - {

        "is successful" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId = service.create(owner, "Test Game")

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId)
            service.listGames(guest) shouldContainExactlyInAnyOrder emptyList()

            service.join(guest, gameId)

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId)
        }

        "unknown game should fail" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId = service.create(owner, "Test Game")

            shouldThrow<GameError.NotFound> {
                service.join(guest, GameId())
            }

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId)
            service.listGames(guest) shouldContainExactlyInAnyOrder emptyList()
        }

        "when already joined should fail" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId = service.create(owner, "Test Game")

            service.join(guest, gameId)

            shouldThrow<GameError.AlreadyMember> {
                service.join(guest, gameId)
            }
        }

    }

    "delete game" - {

        "as owner succeeds" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId1 = service.create(owner, "Test Game 1")
            val gameId2 = service.create(owner, "Test Game 2")
            service.join(guest, gameId1)
            service.join(guest, gameId2)

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

            service.delete(owner, gameId1)

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId2)
        }

        "as member should fail" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId1 = service.create(owner, "Test Game 1")
            val gameId2 = service.create(owner, "Test Game 2")
            service.join(guest, gameId1)
            service.join(guest, gameId2)

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

            shouldThrow<GameError.NotAllowed> {
                service.delete(guest, gameId1)
            }

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
        }

        "unknown game should fail" {
            val service = GameServiceImpl(InMemoryGameRepository())

            val owner = UserId()
            val guest = UserId()
            val gameId1 = service.create(owner, "Test Game 1")
            val gameId2 = service.create(owner, "Test Game 2")
            service.join(guest, gameId1)
            service.join(guest, gameId2)

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

            shouldThrow<GameError.NotFound> {
                service.delete(guest, GameId())
            }

            service.listGames(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            service.listGames(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
        }

    }

})