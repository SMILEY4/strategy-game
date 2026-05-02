package io.github.smiley4.strategygame.platform.tests

import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.GameEngineClient
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.platform.match.domain.MatchParticipantRole
import io.github.smiley4.strategygame.platform.match.domain.MatchParticipantSnapshot
import io.github.smiley4.strategygame.platform.match.domain.MatchRepository
import io.github.smiley4.strategygame.platform.match.domain.MatchServiceImpl
import io.github.smiley4.strategygame.platform.match.domain.MatchState
import io.github.smiley4.strategygame.platform.match.infrastructure.InMemoryMatchRepository
import io.github.smiley4.strategygame.platform.testScope
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class MatchTests : FreeSpec({

    "create" - {
        "should successfully create and save a match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val userId = UserId()
                val matchId = service.create(userId, "Test Match")

                matchId shouldNotBe null
                repository.findById(matchId) shouldNotBe null
                repository.findById(matchId)?.toSnapshot()?.also {
                    it.name shouldBe "Test Match"
                    it.gameId shouldBe null
                    it.state shouldBe MatchState.CONFIGURING
                    it.participants shouldContainExactlyInAnyOrder listOf(MatchParticipantSnapshot(userId, MatchParticipantRole.OWNER))
                }
            }
        }
    }

    "join" - {
        "should add a user as a guest to an existing match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val guestId = UserId()
                val matchId = service.create(ownerId, "Joinable Match")

                service.join(guestId, matchId)

                val match = repository.findById(matchId)
                match?.isParticipant(guestId) shouldBe true
                repository.findById(matchId)?.toSnapshot()?.also {
                    it.participants shouldContainExactlyInAnyOrder listOf(
                        MatchParticipantSnapshot(ownerId, MatchParticipantRole.OWNER),
                        MatchParticipantSnapshot(guestId, MatchParticipantRole.GUEST)
                    )
                }
            }
        }

        "should fail when trying to join a match after game generation" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val gameId = GameId()
                every { gameEngineClient.createGame(any()) } returns gameId

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Test Match")
                service.generateGame(ownerId, matchId)

                shouldThrow<MatchError.InvalidMatchState> {
                    service.join(UserId(), matchId)
                }

                repository.findById(matchId)?.toSnapshot()?.also {
                    it.participants shouldContainExactlyInAnyOrder listOf(
                        MatchParticipantSnapshot(ownerId, MatchParticipantRole.OWNER),
                    )
                }
            }
        }

        "should fail when trying to join a non-existent match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                shouldThrow<MatchError.NotFound> {
                    service.join(UserId(), MatchId())
                }
            }
        }
    }

    "delete" - {
        "should allow the owner to delete the match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()


                val ownerId = UserId()
                val matchId = service.create(ownerId, "To Be Deleted")
                service.delete(ownerId, matchId)

                repository.findById(matchId) shouldBe null
                verify(exactly = 0) { gameEngineClient.deleteGame(any()) }
            }
        }

        "should delete engine game if already generated" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val gameId = GameId()
                every { gameEngineClient.createGame(any()) } returns gameId
                every { gameEngineClient.deleteGame(any()) } returns Unit

                val ownerId = UserId()
                val matchId = service.create(ownerId, "To Be Deleted")
                service.generateGame(ownerId, matchId)

                service.delete(ownerId, matchId)

                repository.findById(matchId) shouldBe null
                verify(exactly = 1) { gameEngineClient.deleteGame(gameId) }
            }
        }

        "should prevent a non-owner from deleting the match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val ownerId = UserId()
                val otherId = UserId()
                val matchId = service.create(ownerId, "Protected Match")

                shouldThrow<MatchError.NotAllowed> {
                    service.delete(otherId, matchId)
                }
                repository.findById(matchId) shouldNotBe null
                verify(exactly = 0) { gameEngineClient.deleteGame(any()) }
            }
        }

        "should prevent a guest from deleting the match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val ownerId = UserId()
                val guestId = UserId()
                val matchId = service.create(ownerId, "Protected Match")
                service.join(guestId, matchId)

                shouldThrow<MatchError.NotAllowed> {
                    service.delete(guestId, matchId)
                }
                repository.findById(matchId) shouldNotBe null
                verify(exactly = 0) { gameEngineClient.deleteGame(any()) }
            }
        }
    }

    "generateGame" - {
        "should create a game through the engine" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Ready Match")

                val gameId = GameId()
                every { gameEngineClient.createGame(any()) } returns gameId

                service.generateGame(ownerId, matchId)

                verify(exactly = 1) { gameEngineClient.createGame(any()) }
                repository.findById(matchId) shouldNotBe null
                repository.findById(matchId)?.toSnapshot()?.also {
                    it.gameId shouldBe gameId
                    it.state shouldBe MatchState.ACTIVE
                }
            }
        }

        "should fail if game generation fails" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()
                val gameEngine = get<GameEngineClient>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Failing Match")

                every { gameEngine.createGame(any()) } throws RuntimeException("Engine Failure")

                shouldThrow<MatchError.GenerateGameFailed> {
                    service.generateGame(ownerId, matchId)
                }
                repository.findById(matchId) shouldNotBe null
                repository.findById(matchId)?.toSnapshot()?.also {
                    it.gameId shouldBe null
                    it.state shouldBe MatchState.CONFIGURING
                }
            }
        }
    }

    "listMatches" - {
        "should return only matches where the user is a participant" {
            testScope {
                val service = get<MatchService>()

                val userA = UserId()
                val userB = UserId()

                val match1 = service.create(userA, "User A Match")
                val match2 = service.create(userB, "User B Match")
                service.join(userA, match2)

                service.listMatches(userA) shouldContainExactly listOf(match1, match2)
                service.listMatches(userB) shouldContainExactly listOf(match2)
            }
        }
    }

})