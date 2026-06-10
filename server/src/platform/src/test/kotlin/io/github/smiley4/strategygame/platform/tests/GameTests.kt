package io.github.smiley4.strategygame.platform.tests

import io.github.smiley4.strategygame.platform.match.DeleteMatchError
import io.github.smiley4.strategygame.platform.match.JoinMatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.GameEngineClient
import io.github.smiley4.strategygame.shared.domain.MatchId
import io.github.smiley4.strategygame.platform.testScope
import io.github.smiley4.strategygame.shared.domain.UserId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.mockk.verify

class GameTests : FreeSpec({

    "creating matches is possible" {
        testScope {
            val service = get<MatchService>()

            val userId = UserId()
            val matchId1 = service.create(userId, "Test Game 1")
            val matchId2 = service.create(userId, "Test Game 2")

            service.listMatches(userId) shouldContainExactlyInAnyOrder listOf(matchId1, matchId2)
        }
    }

    "joining game" - {

        "is successful" {
            testScope {
                val service = get<MatchService>()

                val owner = UserId()
                val guest = UserId()
                val gameId = service.create(owner, "Test Game")

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId)
                service.listMatches(guest) shouldContainExactlyInAnyOrder emptyList()

                service.join(guest, gameId)

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId)
            }
        }

        "unknown game should fail" {
            testScope {
                val service = get<MatchService>()

                val owner = UserId()
                val guest = UserId()
                val gameId = service.create(owner, "Test Game")

                shouldThrow<JoinMatchError.NotFound> {
                    service.join(guest, MatchId())
                }

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId)
                service.listMatches(guest) shouldContainExactlyInAnyOrder emptyList()
            }
        }

        "when already joined should fail" {
            testScope {
                val service = get<MatchService>()

                val owner = UserId()
                val guest = UserId()
                val gameId = service.create(owner, "Test Game")

                service.join(guest, gameId)

                shouldThrow<JoinMatchError.AlreadyMember> {
                    service.join(guest, gameId)
                }
            }
        }

    }

    "delete game" - {

        "as owner succeeds" {
            testScope {
                val service = get<MatchService>()
                val gameEngineClient = get<GameEngineClient>()

                val owner = UserId()
                val guest = UserId()
                val gameId1 = service.create(owner, "Test Game 1")
                val gameId2 = service.create(owner, "Test Game 2")
                service.join(guest, gameId1)
                service.join(guest, gameId2)

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

                service.delete(owner, gameId1)

                verify(exactly = 0) { gameEngineClient.deleteGame(any()) }

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId2)
            }
        }

        "as member should fail" {
            testScope {
                val service = get<MatchService>()

                val owner = UserId()
                val guest = UserId()
                val gameId1 = service.create(owner, "Test Game 1")
                val gameId2 = service.create(owner, "Test Game 2")
                service.join(guest, gameId1)
                service.join(guest, gameId2)

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

                shouldThrow<DeleteMatchError.NotAllowed> {
                    service.delete(guest, gameId1)
                }

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            }
        }

        "unknown game should fail" {
            testScope {
                val service = get<MatchService>()

                val owner = UserId()
                val guest = UserId()
                val gameId1 = service.create(owner, "Test Game 1")
                val gameId2 = service.create(owner, "Test Game 2")
                service.join(guest, gameId1)
                service.join(guest, gameId2)

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)

                shouldThrow<DeleteMatchError.NotFound> {
                    service.delete(guest, MatchId())
                }

                service.listMatches(owner) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
                service.listMatches(guest) shouldContainExactlyInAnyOrder listOf(gameId1, gameId2)
            }
        }

    }

})