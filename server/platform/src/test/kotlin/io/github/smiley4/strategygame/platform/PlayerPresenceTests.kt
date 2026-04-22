package io.github.smiley4.strategygame.platform

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.domain.GameId
import io.github.smiley4.strategygame.platform.game.domain.GameServiceImpl
import io.github.smiley4.strategygame.platform.game.infrastructure.InMemoryGameRepository
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceError
import io.github.smiley4.strategygame.platform.presence.domain.PlayerPresenceServiceImpl
import io.github.smiley4.strategygame.platform.presence.infrastructure.InMemoryPlayerPresenceRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class PlayerPresenceTests : FreeSpec({

    "connect" - {

        "to valid game should succeed" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()
            val gameId = gameService.create(userId, "Test Game")

            presenceService.connect(userId, gameId)

            val snapshot = presenceRepository.findByPlayer(userId)
            snapshot shouldNotBe null
            snapshot?.connectedGame shouldBe gameId
        }

        "to same game should fail" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()
            val gameId = gameService.create(userId, "Test Game")

            presenceService.connect(userId, gameId)

            shouldThrow<PlayerPresenceError.AlreadyConnected> {
                presenceService.connect(userId, gameId)
            }
        }

        "to unknown game should fail" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()

            shouldThrow<PlayerPresenceError.GameNotFound> {
                presenceService.connect(userId, GameId())
            }

            presenceRepository.findByPlayer(userId) shouldBe null
        }

        "without being member should fail" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val gameId = gameService.create(UserId(), "Test Game")

            val userId = UserId()

            shouldThrow<PlayerPresenceError.NotMember> {
                presenceService.connect(userId, gameId)
            }

            presenceRepository.findByPlayer(userId) shouldBe null
        }

    }

    "disconnect" - {

        "from connected game succeeds" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()
            val gameId = gameService.create(userId, "Test Game")
            presenceService.connect(userId, gameId)

            val snapshotConnected = presenceRepository.findByPlayer(userId)
            snapshotConnected shouldNotBe null
            snapshotConnected?.connectedGame shouldBe gameId

            presenceService.disconnect(userId)

            val snapshotDisconnected = presenceRepository.findByPlayer(userId)
            snapshotDisconnected shouldNotBe null
            snapshotDisconnected?.connectedGame shouldBe null
        }

        "disconnect twice should fail" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()
            val gameId = gameService.create(userId, "Test Game")
            presenceService.connect(userId, gameId)
            presenceService.disconnect(userId)

            val snapshotConnected = presenceRepository.findByPlayer(userId)
            snapshotConnected shouldNotBe null
            snapshotConnected?.connectedGame shouldBe null

            shouldThrow<Exception> {
                presenceService.disconnect(userId)
            }

            val snapshotDisconnected = presenceRepository.findByPlayer(userId)
            snapshotDisconnected shouldNotBe null
            snapshotDisconnected?.connectedGame shouldBe null
        }

        "without being connected should fail" {
            val gameRepository = InMemoryGameRepository()
            val presenceRepository = InMemoryPlayerPresenceRepository()
            val gameService = GameServiceImpl(gameRepository)
            val presenceService = PlayerPresenceServiceImpl(presenceRepository, gameRepository)

            val userId = UserId()
            gameService.create(userId, "Test Game")

            presenceRepository.findByPlayer(userId) shouldBe null

            shouldThrow<Exception> {
                presenceService.disconnect(userId)
            }

            presenceRepository.findByPlayer(userId) shouldBe null
        }

    }

})