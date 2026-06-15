package io.github.smiley4.strategygame.platform.tests

import io.github.smiley4.strategygame.platform.match.DeleteMatchError
import io.github.smiley4.strategygame.platform.match.GenerateGameError
import io.github.smiley4.strategygame.platform.match.JoinMatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.MatchParticipantRole
import io.github.smiley4.strategygame.platform.match.domain.MatchParticipantSnapshot
import io.github.smiley4.strategygame.platform.match.domain.MatchRepository
import io.github.smiley4.strategygame.platform.match.domain.MatchState
import io.github.smiley4.strategygame.platform.testScope
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

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

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Test Match")
                service.attachGame(matchId, GameId())

                shouldThrow<JoinMatchError.WrongMatchState> {
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
                val service = get<MatchService>()

                shouldThrow<JoinMatchError.NotFound> {
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

                val ownerId = UserId()
                val matchId = service.create(ownerId, "To Be Deleted")
                service.delete(ownerId, matchId)

                repository.findById(matchId) shouldBe null
            }
        }

        "should delete match after game already attached" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "To Be Deleted")
                service.attachGame(matchId, GameId())
                service.delete(ownerId, matchId)

                repository.findById(matchId) shouldBe null
            }
        }

        "should prevent a non-owner from deleting the match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val otherId = UserId()
                val matchId = service.create(ownerId, "Protected Match")

                shouldThrow<DeleteMatchError.NotAllowed> {
                    service.delete(otherId, matchId)
                }
                repository.findById(matchId) shouldNotBe null
            }
        }

        "should prevent a guest from deleting the match" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val guestId = UserId()
                val matchId = service.create(ownerId, "Protected Match")
                service.join(guestId, matchId)

                shouldThrow<DeleteMatchError.NotAllowed> {
                    service.delete(guestId, matchId)
                }
                repository.findById(matchId) shouldNotBe null
            }
        }
    }

    "generateGame" - {
        "should emit event and keep match in configuring state" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Ready Match")

                service.generateGame(ownerId, matchId)

                repository.findById(matchId)?.toSnapshot()?.also {
                    it.gameId shouldBe null
                    it.state shouldBe MatchState.CONFIGURING
                }
            }
        }

        "should fail when called by non-owner" {
            testScope {
                val service = get<MatchService>()

                val ownerId = UserId()
                val otherId = UserId()
                val matchId = service.create(ownerId, "Protected Match")

                shouldThrow<GenerateGameError.NotAllowed> {
                    service.generateGame(otherId, matchId)
                }
            }
        }

        "should fail when match is already active" {
            testScope {
                val service = get<MatchService>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Active Match")
                service.attachGame(matchId, GameId())

                shouldThrow<GenerateGameError.WrongMatchState> {
                    service.generateGame(ownerId, matchId)
                }
            }
        }
    }

    "attachGame" - {
        "should update match to active with game id" {
            testScope {
                val repository = get<MatchRepository>()
                val service = get<MatchService>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Ready Match")
                val gameId = GameId()

                service.attachGame(matchId, gameId)

                repository.findById(matchId)?.toSnapshot()?.also {
                    it.gameId shouldBe gameId
                    it.state shouldBe MatchState.ACTIVE
                }
            }
        }

        "should fail when match is already active" {
            testScope {
                val service = get<MatchService>()

                val ownerId = UserId()
                val matchId = service.create(ownerId, "Active Match")
                service.attachGame(matchId, GameId())

                shouldThrow<GenerateGameError.WrongMatchState> {
                    service.attachGame(matchId, GameId())
                }
            }
        }

        "should fail for non-existent match" {
            testScope {
                val service = get<MatchService>()

                shouldThrow<GenerateGameError.NotFound> {
                    service.attachGame(MatchId(), GameId())
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
